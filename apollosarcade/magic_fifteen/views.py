from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.http.response import JsonResponse
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django import template
from django.db.models import Q

from .models import Game
from game.models import GameInstruction
from .encoders import QuillFieldEncoder
from apollosarcade.utils import get_player
from apollosarcade.error_handler import LobbyError
from guest.models import Guest

register = template.Library()
# Create your views here.

# Default view, auth only superusers
def magic_fifteen(request):
    return render(request, 'magic_fifteen_home.html',)

def check_for_lobbies(request):
    current_user = get_player(request)
    lobbies = get_games(current_user,['LOBBY','READY','IN-GAME','COMPLETED'],exclude_status=['ARCHIVE'])
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
    # See if the player is already in a lobby
    current_user = get_player(request)
    try:
        games = get_games(current_user, ['READY','LOBBY','REMATCH'])
        if len(games) == 1:
            # If so, update lobby status to IN-GAME and redirect them to the game
            lobby = games[0]
            print(('STARTING GAME #{}').format(lobby.game_id))
            lobby.status='IN-GAME'
            lobby.p1_status='IN-GAME'
            lobby.p2_status='IN-GAME'
            lobby.round=1
            lobby.save()
            return HttpResponseRedirect(f'/magic_fifteen/game/{lobby.game_id}')

        # See if the player is already in a game
        games = get_games(current_user, ['IN-GAME'])
        if len(games) == 1:
            # If so, redirect them to the game
            return HttpResponseRedirect(f'/magic_fifteen/game/{games[0].game_id}')
    
        # Otherwise, they are not in a game or a lobby
        raise LobbyError('You are not in a game lobby or active game')
    except LobbyError as e:
        return JsonResponse({'error': str(e)}, status=400)
    
def game_archival(id):
    to_be_archived = Game.objects.get(game_id=id)
    to_be_archived.status = 'ARCHIVE'
    to_be_archived.save()

def how_to_play(request):
    how_to_play = {}
    instructions = GameInstruction.objects.get(id=1)
    how_to_play['title'] = instructions.title
    how_to_play['instructions'] = instructions.content
    quill_field_data = how_to_play["instructions"].html
    how_to_play["instructions"] = quill_field_data
    return JsonResponse(how_to_play, safe=False, encoder=QuillFieldEncoder)

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
