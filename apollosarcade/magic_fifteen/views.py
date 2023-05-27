from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.http.response import JsonResponse
from django.http import HttpResponseRedirect
from django.shortcuts import render, redirect
from django import template
from django.db.models import Q

from .models import Game, GameInstruction
from .encoders import QuillFieldEncoder
from apollosarcade.utils import get_player
from guest.models import Guest

import json

register = template.Library()
# Create your views here.

# Default view, auth only superusers
def magic_fifteen(request):
    return render(request, 'magic_fifteen_home.html',)

def check_for_lobbies(request):
    current_user = get_player(request)
    lobbies = get_games(current_user, status=['READY','IN-GAME','COMPLETED'],exclude_status=['ARCHIVE'])
    # txt = '{} in {} lobbies'
    # print(txt.format(current_user.username,len(lobbies)))
    if (len(lobbies) >= 1):
        for lobby in lobbies:
            if lobby.status == 'COMPLETED' and ((lobby.p1_status == 'POST' and lobby.p2_status == 'POST') or (lobby.p1_status == 'REMATCH' and lobby.p2_status == 'POST') or (lobby.p1_status == 'POST' and lobby.p2_status == 'REMATCH')):
                return 2
            elif lobby.status == 'COMPLETED' and ((lobby.p1_status == 'POST' and lobby.p2_status == 'ABANDONED') or (lobby.p1_status == 'ABANDONED' and lobby.p2_status == 'POST')):
                game_archival(lobby['game_id'])
                return 0
        return 1
    else:
        return 0

def check_for_match(request):
    if not request.user.is_authenticated:
        print('User not authenticated')
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

def start(request):
    context = {}
    current_user = get_player(request)
    if (current_user.__class__ == Guest):
        context.update({
            'guest': True,
        })
    else:
        context.update({
            'guest': False,
        })
    return render(request, 'magic_fifteen_start.html', context)

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
    current_user = get_player(request)
    games = get_games(current_user, status=['READY'])
    if len(games) == 1:
        return games[0].game_id
    else:
        return 0
        
def player_active_game(request):
    current_user = get_player(request)
    games = get_games(current_user, status=['IN-GAME'])
    if len(games) == 1:
        return games[0].game_id
    else:
        return 0
    
def game(request, game_id):
    current_user = get_player(request)
    game = {}
    match = Game.objects.get(game_id=game_id)
    if (match.status == 'COMPLETED' or match.round == 10):
        return HttpResponseRedirect('/magic_fifteen/post')
    if (current_user == match.player_one):
        try:
            if (str(ContentType.objects.get_for_model(match.player_two)) == 'auth | user'):
                player2 = User.objects.get(id=match.player_two_object_id)
            else:
                player2 = Guest.objects.get(id=match.player_two_object_id)
            game.update({
                'player1': current_user.username,
                'player2': player2.username,
                'p1': current_user.id,
                'p2': player2.id,
            })
        except User.DoesNotExist:
            raise Exception('Game was abandoned by player 2')
    elif (current_user == match.player_two):
        try:
            if (str(ContentType.objects.get_for_model(match.player_one)) == 'auth | user'):
                player1 = User.objects.get(id=match.player_one_object_id)
            else:
                player1 = Guest.objects.get(id=match.player_one_object_id)
            game.update({
                'player1': player1.username,
                'player2': current_user.username,
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
        'current': current_user.id,
    })
    return render(request, 'magic_fifteen_game.html', game)

def game_leave(request, game_id):
    if request.method == 'POST':
        current_user = get_player(request)
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

# # Custom filter for front-end to cut out zeroes on board used in spaces attribute
# @register.filter(name='cut')
# def cut(value, arg):
#     return value.replace(arg, '')

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

def get_games(user, status=None, exclude_status=None, player_field=None):
    user_content_type = ContentType.objects.get_for_model(user)

    # print(f"user_content_type: {user_content_type}, user.id: {user.id}")
    games = Game.objects.filter((Q(player_one_content_type=user_content_type) & Q(player_one_object_id=user.id)) | (Q(player_two_content_type=user_content_type) & Q(player_two_object_id=user.id)))
    # print(f"games after initial filter: {games}")
    if status:
        games = games.filter(status__in=status)
        # print(f"games after status filter: {games}")
    if exclude_status:
        games = games.exclude(status__in=exclude_status)
        # print(f"games after exclude_status filter: {games}")
    if player_field:
        games = games.filter(**{player_field: user})
        # print(f"games after player_field filter: {games}")
    return games
