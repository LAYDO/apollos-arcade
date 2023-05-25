from django.contrib import messages
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.contrib.contenttypes.models import ContentType

from .views import check_for_lobbies, get_games
from apollosarcade.utils import get_player

from .models import Game
from .forms import CreateLobbyForm, JoinLobbyForm
from guest.models import Guest

def create_lobby(request):
    if request.method == 'POST':
        if (check_for_lobbies(request)):
            return
        else:
            form = CreateLobbyForm(request.POST)
            current_user = get_player(request)
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
            
def join_lobby(request):
    if request.method == 'POST':
        if (check_for_lobbies(request) > 0):
            return
        else:
            form = JoinLobbyForm(request.POST)
            current_user = get_player(request)
            if form.is_valid():
                f = form.cleaned_data
                if (f['join'] == 'Lobby Number'):
                    game = Game.objects.get(game_id=f['join_option'])
                    if game.privacy == 'Public' or (game.privacy == 'Private' and game.password == f['password']) or game.status != 'REMATCH':
                        if game.player_one== None:
                            game.player_one = current_user
                        elif game.player_two == None:
                            game.player_two = current_user
                        game.status = 'READY'
                        game.save()
                        return HttpResponseRedirect(f'/magic_fifteen/lobby/')
                    else:
                        messages.error(request, "Incorrect password for the lobby you are trying to join")
                        return HttpResponseRedirect(f'/magic_fifteen/start/')
                else:
                    games = Game.objects.filter(status__in=['LOBBY']).exclude(status__in=['REMATCH'])
                    if (games):
                        game = Game.objects.get(game_id=games[0].game_id)
                    else:
                        raise Exception('No lobbies found')
                    if game.player_one == None:
                        game.player_one=current_user
                    elif game.player_two == None:
                        game.player_two=current_user
                    game.status = 'READY'
                    game.save()
                    return HttpResponseRedirect(f'/magic_fifteen/lobby/')

def lobby(request):
    current_user = get_player(request)
    print(f'Current user id: {current_user.id}')
    lobby = {}
    try:
        found = get_games(current_user, ['LOBBY', 'REMATCH', 'READY', 'IN-GAME'], [])
        if (len(found) == 1 and found[0].player_one == current_user):
            print(f'p1: {found[0]}')
            player2 = None
            if (found[0].player_two != None):
                if (str(ContentType.objects.get_for_model(found[0].player_two)).lower() == 'auth | user'):
                    player2 = User.objects.get(id=found[0].player_two_object_id).username
                else:
                    player2 = Guest.objects.get(id=found[0].player_two_object_id).username            
            lobby.update({
                'id': found[0].game_id,
                'status': found[0].status,
                'p1': current_user.username,
                'p2': 'Waiting for player...' if player2 == None else player2,
                'privacy': found[0].privacy,
                'pw': found[0].password,
            })
        elif (len(found) == 1 and found[0].player_two == current_user):
            print(f'p2: {found[0]}')
            player1 = None
            if (found[0].player_one != None):
                if (str(ContentType.objects.get_for_model(found[0].player_one)).lower() == 'auth | user'):
                    player1 = User.objects.get(id=found[0].player_one_object_id).username
                else:
                    player1 = Guest.objects.get(id=found[0].player_one_object_id).username
            lobby.update({
                'id': found[0].game_id,
                'status': found[0].status,
                'p1': 'Waiting for player...' if player1 == None else player1,
                'p2': current_user.username,
                'privacy': found[0].privacy,
                'pw': found[0].password,
            })
    except:
        raise Exception('Lobby not found!')
        
    return render(request, 'magic_fifteen_lobby.html', lobby)

def lobby_leave(request):
    if request.method == 'POST':
        current_user = get_player(request)
        try:
            found = get_games(current_user, ['LOBBY', 'REMATCH', 'READY', 'IN-GAME'], [])
            if (len(found) == 1 and found[0].player_one == current_user):
                p = Game.objects.get(game_id=found[0].game_id)
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
            elif (len(found) == 1 and found[0].player_two == current_user):
                p = Game.objects.get(game_id=found[0].game_id)
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
        except:
            raise Exception('Lobby not found!')
        return HttpResponseRedirect('/magic_fifteen')