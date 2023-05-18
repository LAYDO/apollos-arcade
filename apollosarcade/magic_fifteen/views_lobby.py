from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from django.shortcuts import render

from .views import game_archival, check_for_lobbies

from .models import Game
from .forms import CreateLobbyForm, JoinLobbyForm




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
                    player_one=current_user,
                    player_two=None,
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
        if (check_for_lobbies(request) > 0):
            return
        else:
            form = JoinLobbyForm(request.POST)
            current_user = request.user
            if form.is_valid():
                f = form.cleaned_data
                if (f['join'] == 'Lobby Number'):
                    game = Game.objects.get(game_id=f['join_option'])
                    if game.privacy == 'Public' or (game.privacy == 'Private' and game.password == f['password']) or game.status != 'REMATCH':
                        if game.player_one == None:
                            game.player_one=current_user
                        elif game.player_two == None:
                            game.player_two=current_user
                        game.status = 'READY'
                        game.save()
                        return HttpResponseRedirect(f'/magic_fifteen/lobby/')
                    else:
                        messages.error(request, "Incorrect password for the lobby you are trying to join")
                        return HttpResponseRedirect(f'/magic_fifteen/start/')
                else:
                    games = list(Game.objects.filter(status='LOBBY', player_two=None).exclude(status='REMATCH').all().values())
                    games.extend(list(Game.objects.filter(status='LOBBY', player_one=None).exclude(status='REMATCH').all().values()))
                    game = Game.objects.get(game_id=games[0]['game_id'])
                    if game.player_one == None:
                        game.player_one=current_user
                    elif game.player_two == None:
                        game.player_two=current_user
                    game.status = 'READY'
                    game.save()
                    return HttpResponseRedirect(f'/magic_fifteen/lobby/')

@login_required
def lobby(request):
    current_user = request.user
    print(f'Current user id: {current_user.id}')
    lobby = {}
    try:
        p1 = list(Game.objects.filter(player_one=current_user, status='LOBBY').all().values())
        p1.extend(list(Game.objects.filter(player_one=current_user, status='REMATCH').all().values()))
        p1.extend(list(Game.objects.filter(player_one=current_user, status='READY').all().values()))
        p1.extend(list(Game.objects.filter(player_one=current_user, status='IN-GAME').all().values()))
        p2 = list(Game.objects.filter(player_two=current_user, status='LOBBY').all().values())
        p2.extend(list(Game.objects.filter(player_two=current_user, status='REMATCH').all().values()))
        p2.extend(list(Game.objects.filter(player_two=current_user, status='READY').all().values()))
        p2.extend(list(Game.objects.filter(player_two=current_user, status='IN-GAME').all().values()))
        print(f'p1: {p1}\np2: {p2}')
        if (len(p1) == 1):
            print(f'p1: {p1[0]}')
            player2 = None
            if (p1[0]['player_two_id'] != None):
                player2 = User.objects.get(id=p1[0]['player_two_id']).username
            lobby.update({
                'id': p1[0]['game_id'],
                'status': p1[0]['status'],
                'p1': current_user.username,
                'p2': 'Waiting for player...' if player2 == None else player2,
                'privacy': p1[0]['privacy'],
                'pw': p1[0]['password'],
            })
        elif (len(p2) == 1):
            print(f'p2: {p2[0]}')
            player1 = None
            if (p2[0]['player_one_id'] != None):
                player1 = User.objects.get(id=p2[0]['player_one_id']).username
            lobby.update({
                'id': p2[0]['game_id'],
                'status': p2[0]['status'],
                'p1': 'Waiting for player...' if player1 == None else player1,
                'p2': current_user.username,
                'privacy': p2[0]['privacy'],
                'pw': p2[0]['password'],
            })
    except:
        raise Exception('Lobby not found!')
        
    return render(request, 'magic_fifteen_lobby.html', lobby)

@login_required
def lobby_leave(request):
    if request.method == 'POST':
        current_user = request.user
        p1 = list(Game.objects.filter(player_one=current_user, status='LOBBY').all().values())
        p1.extend(list(Game.objects.filter(player_one=current_user, status='REMATCH').all().values()))
        p1.extend(list(Game.objects.filter(player_one=current_user, status='READY').all().values()))
        p1.extend(list(Game.objects.filter(player_one=current_user, status='IN-GAME').all().values()))
        p2 = list(Game.objects.filter(player_two=current_user, status='LOBBY').all().values())
        p2.extend(list(Game.objects.filter(player_two=current_user, status='REMATCH').all().values()))
        p2.extend(list(Game.objects.filter(player_two=current_user, status='READY').all().values()))
        p2.extend(list(Game.objects.filter(player_two=current_user, status='IN-GAME').all().values()))
        if (len(p1) == 1):
            p = Game.objects.get(game_id=p1[0]['game_id'])
            if (p.status == 'IN-GAME'):
                p.winner=p.player_two_id
                p.loser=p.player_one_id
                p.status='COMPLETED'
                p.p1_status='ABANDONED'
                p.p2_status='POST'
            else:
                p.player_one=None
                p.status='LOBBY'
            p.save()
        elif (len(p2) == 1):
            p = Game.objects.get(game_id=p2[0]['game_id'])
            if (p.status == 'IN-GAME'):
                p.winner=p.player_one_id
                p.loser=p.player_two_id
                p.status='COMPLETED'
                p.p2_status='ABANDONED'
                p.p1_status='POST'
            else:
                p.player_two=None
                p.status='LOBBY'
            p.save()
        return HttpResponseRedirect('/magic_fifteen')