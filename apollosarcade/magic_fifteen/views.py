from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http.response import JsonResponse
from django.http import HttpResponseRedirect
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django import template

from .models import Game, GameInstruction
from .forms import CreateLobbyForm, JoinLobbyForm
from .encoders import QuillFieldEncoder

import json

register = template.Library()
# Create your views here.

# Default view, auth only superusers
def magic_fifteen(request):
    return render(request, 'magic_fifteen_home.html',)

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
def check_for_lobbies(request):
    current_user = request.user
    lobbies = list(Game.objects.filter(player_one=current_user.id).exclude(status='ARCHIVE').all().values())
    lobbies.extend(list(Game.objects.filter(player_two=current_user.id).exclude(status='ARCHIVE').all().values()))
    txt = '{} in {} lobbies'
    print(txt.format(current_user.username,len(lobbies)))
    if (len(lobbies) == 1):
        if lobbies[0]['status'] == 'COMPLETED':
            return 2
        return 1
    else:
        return 0

@login_required
def start(request):
    return render(request, 'magic_fifteen_start.html',)

@login_required
def create_lobby(request):
    if request.method == 'POST':
        if (check_for_lobbies(request)):
            return
        else:
            form = CreateLobbyForm(request.POST)
            current_user = request.user
            if form.is_valid():
                f = form.cleaned_data
                print(f['create_option'])
                game = Game(
                    status='LOBBY',
                    player_one=current_user.id,
                    p1_status='UNREADY',
                    player_two=0,
                    p2_status='UNREADY',
                    round=0,
                    winner=0,
                    loser=0,
                    privacy=f['create'],
                    password=f['create_option'],
                    plays=[],
                    spaces=[0,0,0,0,0,0,0,0,0],
                )
                game.save()
                return HttpResponseRedirect(f'/magic_fifteen/lobby/')
            
@login_required
def join_lobby(request):
    if request.method == 'POST':
        if (check_for_lobbies(request)[0] > 0):
            return
        else:
            form = JoinLobbyForm(request.POST)
            current_user = request.user
            if form.is_valid():
                f = form.cleaned_data
                if (f['join'] == 'Lobby Number'):
                    game = Game.objects.get(game_id=f['join_option'])
                    if game.player_one == 0:
                        game.player_one=current_user.id
                        game.save()
                    elif game.player_two == 0:
                        game.player_two=current_user.id
                        game.save()
                    return HttpResponseRedirect(f'/magic_fifteen/lobby/')
                else:
                    games = list(Game.objects.filter(status='LOBBY').filter(player_two=0).all().values())
                    games.extend(list(Game.objects.filter(status='LOBBY').filter(player_one=0).all().values()))
                    game = Game.objects.get(game_id=games[0]['game_id'])
                    if game.player_one == 0:
                        game.player_one=current_user.id
                        game.save()
                    elif game.player_two == 0:
                        game.player_two=current_user.id
                        game.save()
                    return HttpResponseRedirect(f'/magic_fifteen/lobby/')

@login_required
def lobby(request):
    current_user = request.user
    lobby = {}
    p1 = list(Game.objects.filter(player_one=current_user.id).exclude(status='ARCHIVE').all().values())
    p2 = list(Game.objects.filter(player_two=current_user.id).exclude(status='ARCHIVE').all().values())
    if (len(p1) == 1):
        player2 = 0
        if (p1[0]['player_two'] > 0):
            player2 = User.objects.filter(id=p1[0]['player_two'])[0].username
        lobby.update({
            'id': p1[0]['game_id'],
            'status': p1[0]['status'],
            'p1': current_user.username,
            'p1_status': p1[0]['p1_status'],
            'p2': player2,
            'p2_status': p1[0]['p2_status'],
            'privacy': p1[0]['privacy'],
            'pw': p1[0]['password'],
        })
    elif (len(p2) == 1):
        player1 = 0
        if (p2[0]['player_two'] > 0):
            player1 = User.objects.filter(id=p2[0]['player_one'])[0].username
        lobby.update({
            'id': p2[0]['game_id'],
            'status': p2[0]['status'],
            'p1': player1,
            'p1_status': p2[0]['p1_status'],
            'p2': current_user.username,
            'p2_status': p2[0]['p2_status'],
            'privacy': p2[0]['privacy'],
            'pw': p2[0]['password'],
        })
    return render(request, 'magic_fifteen_lobby.html', lobby)
    
@login_required
def game_ready(request):
    if request.method == 'POST':
        current_user = request.user
        p1 = list(Game.objects.filter(player_one=current_user.id).exclude(status='ARCHIVE').all().values())
        p2 = list(Game.objects.filter(player_two=current_user.id).exclude(status='ARCHIVE').all().values())
        if (len(p1) == 1):
            p = Game.objects.get(game_id=p1[0]['game_id'])
            p.p1_status='READY'
            p.save()
        elif (len(p2) == 1):
            p = Game.objects.get(game_id=p2[0]['game_id'])
            p.p2_status='READY'
            p.save()
        return redirect(request.META['HTTP_REFERER'])

@login_required
def game_unready(request):
    if request.method == 'POST':
        current_user = request.user
        p1 = list(Game.objects.filter(player_one=current_user.id).exclude(status='ARCHIVE').all().values())
        p2 = list(Game.objects.filter(player_two=current_user.id).exclude(status='ARCHIVE').all().values())
        if (len(p1) == 1):
            p = Game.objects.get(game_id=p1[0]['game_id'])
            p.p1_status='UNREADY'
            p.save()
        elif (len(p2) == 1):
            p = Game.objects.get(game_id=p2[0]['game_id'])
            p.p2_status='UNREADY'
            p.save()
        return redirect(request.META['HTTP_REFERER'])
    
@login_required
def game_leave(request):
    if request.method == 'POST':
        current_user = request.user
        p1 = list(Game.objects.filter(player_one=current_user.id).exclude(status='ARCHIVE').all().values())
        p2 = list(Game.objects.filter(player_two=current_user.id).exclude(status='ARCHIVE').all().values())
        if (len(p1) == 1):
            p = Game.objects.get(game_id=p1[0]['game_id'])
            p.p1_status='UNREADY'
            p.player_one=0
            p.save()
        elif (len(p2) == 1):
            p = Game.objects.get(game_id=p2[0]['game_id'])
            p.p2_status='UNREADY'
            p.player_two=0
            p.save()
        return HttpResponseRedirect('/magic_fifteen')

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
    games = list(Game.objects.filter(status='LOBBY').filter(player_two=current_user.id).all().values())
    games.extend(list(Game.objects.filter(status='LOBBY').filter(player_one=current_user.id).all().values()))
    if len(games) == 1:
        return games[0]['game_id']
    else:
        return 0
        
def player_active_game(request):
    current_user = request.user
    games = list(Game.objects.filter(player_two=current_user.id).exclude(status__in=['ARCHIVE','LOBBY']).all().values())
    games.extend(list(Game.objects.filter(player_one=current_user.id).exclude(status__in=['ARCHIVE','LOBBY']).all().values()))
    if len(games) == 1:
        return games[0]['game_id']
    else:
        return 0
    
@login_required
def game(request, game_id):
    current_user = request.user
    game = {}
    match = Game.objects.get(game_id=game_id)
    if (match.status == 'COMPLETED'):
        return HttpResponseRedirect('/magic_fifteen/post')
    if (current_user.id == match.player_one):
        player2 = User.objects.get(id=match.player_two)
        game.update({
            'player1': current_user.username,
            'player2': player2.username,
            'p1': current_user.id,
            'p2': player2.id,
        })
    elif (current_user.id == match.player_two):
        player1 = User.objects.get(id=match.player_one)
        game.update({
            'player1': player1.username,
            'player2': current_user.username,
            'p1': player1.id,
            'p2': current_user.id,
        })
    game.update({
        'id': game_id,
        'privacy': match.privacy,
        'spaces': match.spaces,
        'plays': match.plays,
        'round': match.round,
    })

    return render(request, 'magic_fifteen_game.html', game)
    
def checkWin(game):
    if game.round <= 9:
        for i in game.winningArrays:
            temp = list()
            for x in i:
                if game.spaces[x] != 0:
                    temp.append(game.spaces[x])
            if (len(temp) == 3 and sum(temp) == 15):
                return True
            temp.clear()
    return False
    

@login_required
def post(request):
    current_user = request.user
    post = {}
    lobbies = list(Game.objects.filter(player_one=current_user.id).exclude(status='ARCHIVE').exclude(status='COMPLETED').all().values())
    lobbies.extend(list(Game.objects.filter(player_two=current_user.id).exclude(status='ARCHIVE').exclude(status='COMPLETED').all().values()))
    if len(lobbies) > 0:
        return HttpResponseRedirect(f'/magic_fifteen/lobby')
    games = list(Game.objects.filter(player_one=current_user.id).filter(status='COMPLETED').all().values())
    games.extend(list(Game.objects.filter(player_two=current_user.id).filter(status='COMPLETED').all().values()))
    if (len(games) == 1):
        game = Game.objects.get(game_id=games[0]['game_id'])
        if (game):
            winner = User.objects.get(id=game.winner)
            loser = User.objects.get(id=game.loser)
            post.update({
                'id': game.game_id,
                'privacy': game.privacy,
                'player_one': game.player_one,
                'player_two': game.player_two,
                'p1_status': game.p1_status,
                'p2_status': game.p2_status,
                'winner_id': game.winner,
                'loser_id': game.loser,
                'winner': winner.username,
                'loser': loser.username,
                'spaces': game.spaces,
                'pw': game.password,
            })
    return render(request, 'magic_fifteen_post.html', post)

@login_required
def post_rematch(request):
    if request.method == 'POST':
        current_user = request.user
        p1 = list(Game.objects.filter(player_one=current_user.id).exclude(status='ARCHIVE').all().values())
        p2 = list(Game.objects.filter(player_two=current_user.id).exclude(status='ARCHIVE').all().values())
        if (len(p1) == 1):
            p = Game.objects.get(game_id=p1[0]['game_id'])
            p.p1_status='REMATCH'
            p.save()
            if (p.p2_status == 'REMATCH'):
                game_archival(p.game_id)
                game = Game(
                    status='LOBBY',
                    player_one=p.winner,
                    p1_status='UNREADY',
                    player_two=p.loser,
                    p2_status='UNREADY',
                    round=0,
                    winner=0,
                    loser=0,
                    privacy='Public',
                    plays=[],
                    spaces=[0,0,0,0,0,0,0,0,0],
                )
                game.save()
                return HttpResponseRedirect(f'/magic_fifteen/lobby')
            elif (p.p2_status == 'LEFT'):
                game_archival(p.game_id)
                return HttpResponseRedirect('/magic_fifteen')
        elif (len(p2) == 1):
            p = Game.objects.get(game_id=p2[0]['game_id'])
            p.p2_status='REMATCH'
            p.save()
            if (p.p1_status == 'REMATCH'):
                game_archival(p.game_id)
                game = Game(
                    status='LOBBY',
                    player_one=p.winner,
                    p1_status='UNREADY',
                    player_two=p.loser,
                    p2_status='UNREADY',
                    round=0,
                    winner=0,
                    loser=0,
                    privacy='Public',
                    plays=[],
                    spaces=[0,0,0,0,0,0,0,0,0],
                )
                game.save()
                return HttpResponseRedirect(f'/magic_fifteen/lobby')
            elif (p.p1_status == 'LEFT'):
                game_archival(p.game_id)
                return HttpResponseRedirect('/magic_fifteen')
        # return HttpResponseRedirect(f'/magic_fifteen/post/')
        return redirect(request.META['HTTP_REFERER'])
    
@login_required
def post_leave(request):
    if request.method == 'POST':
        current_user = request.user
        p1 = list(Game.objects.filter(player_one=current_user.id).exclude(status='ARCHIVE').all().values())
        p2 = list(Game.objects.filter(player_two=current_user.id).exclude(status='ARCHIVE').all().values())
        if (len(p1) == 1):
            p = Game.objects.get(game_id=p1[0]['game_id'])
            p.p1_status='LEFT'
            if p.p2_status == 'LEFT':
                game_archival(p.game_id)
        elif (len(p2) == 1):
            p = Game.objects.get(game_id=p2[0]['game_id'])
            p.p2_status='LEFT'
            if p.p1_status == 'LEFT':
                game_archival(p.game_id)
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