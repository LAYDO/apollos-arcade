from django.contrib.auth.models import User
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.contrib.contenttypes.models import ContentType

from apollosarcade.utils import get_player, get_games, get_app_model
from apollosarcade.error_handler import LobbyError
from guest.models import Guest

from home.views import check_for_lobbies
from .forms import CreateLobbyForm, JoinLobbyForm

def create_lobby(request):
    if request.method == 'POST':
        if (check_for_lobbies(request)):
            return
        else:
            form = CreateLobbyForm(request.POST)
            current_user = get_player(request)
            Game = get_app_model(request, 'game')
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
                return JsonResponse({'redirect': f'/magic_fifteen/lobby/{game.game_id}'})
            
def join_lobby(request):
    if request.method == 'POST':
        if (check_for_lobbies(request) > 0):
            return
        else:
            try:
                form = JoinLobbyForm(request.POST)
                current_user = get_player(request)
                Game = get_app_model(request, 'game')
                if form.is_valid():
                    fClean = form.cleaned_data
                    print(f"Password: {fClean['password']}")
                    if (fClean['join'] == 'Lobby Number'):
                        game = Game.objects.get(game_id=fClean['join_option'])
                        if game.privacy == 'Public':
                            if game.status == 'REMATCH':
                                raise LobbyError("This lobby is currently in a rematch, please join another lobby")
                            if game.player_one== None:
                                game.player_one = current_user
                            elif game.player_two == None:
                                game.player_two = current_user
                            game.save()
                        elif(game.privacy == 'Private' and fClean['password'] == game.password):
                            if game.has_players():
                                if game.player_one== None:
                                    game.player_one = current_user
                                elif game.player_two == None:
                                    game.player_two = current_user
                            game.save()
                        elif (game.privacy == 'Private' and fClean['password'] == ''):
                            raise LobbyError("This lobby is private, please enter the password")
                        else:
                            raise LobbyError("Incorrect password for the lobby you are trying to join")
                    else:
                        games = Game.objects.filter(status__in=['LOBBY']).exclude(status__in=['REMATCH'])
                        if (games):
                            game = Game.objects.get(game_id=games[0].game_id)
                        else:
                            raise LobbyError('No lobbies found')
                        if game.player_one == None:
                            game.player_one=current_user
                        elif game.player_two == None:
                            game.player_two=current_user
                        game.save()
                    return JsonResponse({'redirect': f'/magic_fifteen/lobby/{game.game_id}'})
            except LobbyError as e:
                return JsonResponse({'error': str(e)}, status=400)

def lobby(request, game_id):
    current_user = get_player(request)
    # print(f'Current user id: {current_user.id}')
    lobby = {}
    try:
        Game = get_app_model(request, 'game')
        game = Game.objects.get(game_id=game_id)
        # found = get_games(request, ['LOBBY', 'REMATCH', 'READY', 'IN-GAME'], [])
        if (game.player_one == current_user):
            # print(f'p1: {game}')
            player2 = None
            if (game.player_two != None):
                if (str(ContentType.objects.get_for_model(game.player_two)).lower() == 'auth | user'):
                    player2 = User.objects.get(id=game.player_two_object_id).username
                else:
                    player2 = Guest.objects.get(id=game.player_two_object_id).username            
            lobby.update({
                'id': game.game_id,
                'status': game.status,
                'p1': current_user.username,
                'p2': 'Waiting for player...' if player2 == None else player2,
                'p1ID': current_user.id,
                'p2ID': game.player_two_object_id,
                'p1Status': game.p1_status,
                'p2Status': game.p2_status,
                'privacy': game.privacy,
                'pw': game.password,
                'current': current_user.id,
                'round': game.round,
            })
            return render(request, 'magic_fifteen_lobby.html', lobby)
        elif (game.player_two == current_user):
            # print(f'p2: {game}')
            player1 = None
            if (game.player_one != None):
                if (str(ContentType.objects.get_for_model(game.player_one)).lower() == 'auth | user'):
                    player1 = User.objects.get(id=game.player_one_object_id).username
                else:
                    player1 = Guest.objects.get(id=game.player_one_object_id).username
            lobby.update({
                'id': game.game_id,
                'status': game.status,
                'p1': 'Waiting for player...' if player1 == None else player1,
                'p2': current_user.username,
                'p1ID': game.player_one_object_id,
                'p2ID': current_user.id,
                'p1Status': game.p1_status,
                'p2Status': game.p2_status,
                'privacy': game.privacy,
                'pw': game.password,
                'current': current_user.id,
                'round': game.round,
            })
            return render(request, 'magic_fifteen_lobby.html', lobby)
        else:
            raise LobbyError('Lobby not found!')
    except LobbyError as e:
        return JsonResponse({'error': str(e)}, status=400)