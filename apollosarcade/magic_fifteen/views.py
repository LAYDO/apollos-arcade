from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http.response import JsonResponse
from django.http import HttpResponseRedirect
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django import template
from django.db.models import Q

from .models import Game, GameInstruction
from .encoders import QuillFieldEncoder

import json

register = template.Library()
# Create your views here.

# Default view, auth only superusers
def magic_fifteen(request):
    return render(request, 'magic_fifteen_home.html',)

@login_required
def check_for_lobbies(request):
    current_user = request.user
    lobbies = list(Game.objects.filter(player_one=current_user).exclude(status='ARCHIVE').all().values())
    lobbies.extend(list(Game.objects.filter(player_two=current_user).exclude(status='ARCHIVE').all().values()))
    txt = '{} in {} lobbies'
    print(txt.format(current_user.username,len(lobbies)))
    if (len(lobbies) >= 1):
        for lobby in lobbies:
            if lobby['status'] == 'COMPLETED' and ((lobby['p1_status'] == 'POST' and lobby['p2_status'] == 'POST') or (lobby['p1_status'] == 'REMATCH' and lobby['p2_status'] == 'POST') or (lobby['p1_status'] == 'POST' and lobby['p2_status'] == 'REMATCH')):
                return 2
            elif lobby['status'] == 'COMPLETED' and ((lobby['p1_status'] == 'POST' and lobby['p2_status'] == 'ABANDONED') or (lobby['p1_status'] == 'ABANDONED' and lobby['p2_status'] == 'POST')):
                game_archival(lobby['game_id'])
                return 0
        return 1
    else:
        return 0

@login_required
def check_for_match(request):
    if not request.user.is_authenticated:
        print('User not authenticated')
        messages.warning(request, "You must be logged in to access this page.")
        return redirect('login')  # Replace 'login' with the name of your login view
    url = 'magic_fifteen/'
    match (check_for_lobbies(request)):
        case 2:
            url += 'post'
        case 1:
            url += 'lobby'
        case 0:
            url += 'start'
    match = {}
    match.update({
        'pathname': url,
    })
    return JsonResponse(match, safe=False)

@login_required
def start(request):
    return render(request, 'magic_fifteen_start.html',)

@login_required  
def game_start_continue(request):
    if request.method == 'POST':
        try:
            lobbyNum = player_active_lobby(request)
            lobby = Game.objects.get(game_id=lobbyNum)
        except Game.DoesNotExist:
            lobby = None
        if lobby:
            print(('STARTING GAME #{}').format(lobby.game_id))
            lobby.status='IN-GAME'
            lobby.p1_status='IN-GAME'
            lobby.p2_status='IN-GAME'
            lobby.round=1
            lobby.save()
            return HttpResponseRedirect(f'/magic_fifteen/game/{lobbyNum}')
        try:
            gameNum = player_active_game(request)
            game = Game.objects.get(game_id=gameNum)
        except Game.DoesNotExist:
            game = None
        if game:
            print(('CONTINUING GAME #{}').format(game.game_id))
            return HttpResponseRedirect(f'/magic_fifteen/game/{game.game_id}')
        
def player_active_lobby(request):
    current_user = request.user
    games = list(Game.objects.filter(status='READY').filter(player_two=current_user).all().values())
    games.extend(list(Game.objects.filter(status='READY').filter(player_one=current_user).all().values()))
    if len(games) == 1:
        return games[0]['game_id']
    else:
        return 0
        
def player_active_game(request):
    current_user = request.user
    games = list(Game.objects.filter(player_two=current_user,status='IN-GAME').all().values())
    games.extend(list(Game.objects.filter(player_one=current_user,status='IN-GAME').all().values()))
    if len(games) == 1:
        return games[0]['game_id']
    else:
        return 0
    
@login_required
def game(request, game_id):
    current_user = request.user
    game = {}
    match = Game.objects.get(game_id=game_id)
    if (match.status == 'COMPLETED' or match.round == 10):
        return HttpResponseRedirect('/magic_fifteen/post')
    if (current_user == match.player_one):
        try:
            player2 = User.objects.get(username=match.player_two)
            game.update({
                'player1': current_user,
                'player2': player2.username,
                'p1': current_user.id,
                'p2': player2.id,
            })
        except User.DoesNotExist:
            raise Exception('Game was abandoned by player 2')
    elif (current_user == match.player_two):
        try:
            player1 = User.objects.get(username=match.player_one)
            game.update({
                'player1': player1.username,
                'player2': current_user,
                'p1': player1.id,
                'p2': current_user.id,
            })
        except User.DoesNotExist:
            raise Exception('Game was abandoned by player 1')
    else:
        raise Exception('User is not a player in this game')
    game.update({
        'id': game_id,
        'privacy': match.privacy,
        'spaces': match.spaces,
        'plays': match.plays,
        'round': match.round,
    })
    return render(request, 'magic_fifteen_game.html', game)

@login_required
def game_leave(request, game_id):
    if request.method == 'POST':
        current_user = request.user
        match = Game.objects.get(game_id=game_id)
        if (match and match.status == 'IN-GAME'):
            if (match.player_one == current_user):
                match.p1_status='ABANDONED'
                match.p2_status='POST'
                match.winner=match.player_two_id
                match.loser=match.player_one_id
            elif (match.player_two == current_user):
                match.p2_status='ABANDONED'
                match.p1_status='POST'
                match.winner=match.player_one_id
                match.loser=match.player_two_id
            match.status='COMPLETED'
            match.save()
        return HttpResponseRedirect('/magic_fifteen')
    
def game_archival(id):
    to_be_archived = Game.objects.get(game_id=id)
    to_be_archived.status = 'ARCHIVE'
    to_be_archived.save()

# Proof of concept for building metrics
@csrf_exempt
def user_click(request):
    if request.method == 'POST':
        txt = 'User clicked {}'
        click = json.loads(request.body)
        print(txt.format(click['target']))
        return JsonResponse(click, safe=False)

# Custom filter for front-end to cut out zeroes on board used in spaces attribute
@register.filter(name='cut')
def cut(value, arg):
    return value.replace(arg, '')

def how_to_play(request):
    how_to_play = {}
    instructions = GameInstruction.objects.get(id=1)
    how_to_play['title'] = instructions.title
    how_to_play['instructions'] = instructions.content
    quill_field_data = how_to_play["instructions"].html
    how_to_play["instructions"] = quill_field_data
    return JsonResponse(how_to_play, safe=False, encoder=QuillFieldEncoder)

def local(request):
    return render(request, 'ttt.html')

def get_games(user, in_statuses, ex_statuses):
    return Game.objects.filter(Q(player_one=user) | Q(player_two=user)).filter(status__in=in_statuses).exclude(status__in=ex_statuses)