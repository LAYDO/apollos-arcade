from django.http import HttpResponseRedirect
from django.shortcuts import render

from apollosarcade.utils import get_player, get_player_by_content_type, game_archival, get_games, get_app_model

def post(request):

    post = {}
    lobbies = get_games(request, ['LOBBY','REMATCH'], [])
    if len(lobbies) > 0:
        return HttpResponseRedirect(f'/magic_fifteen/lobby')
    games = get_games(request, ['COMPLETED'], [])
    Game = get_app_model(request, 'game')
    if (len(games) == 1):
        game = Game.objects.get(game_id=games[0].game_id)
        if (game):
            if (game.round == 10 and game.winner == 0 and game.loser == 0):
                winner = get_player_by_content_type(game.player_one_content_type, game.player_one_object_id)
                loser = get_player_by_content_type(game.player_two_content_type, game.player_two_object_id)
            else:
                if (game.winner == game.player_one_object_id):
                    winner = get_player_by_content_type(game.player_one_content_type, game.winner)
                    loser = get_player_by_content_type(game.player_two_content_type, game.loser)
                else:
                    winner = get_player_by_content_type(game.player_two_content_type, game.winner)
                    loser = get_player_by_content_type(game.player_one_content_type, game.loser)
            post.update({
                'id': game.game_id,
                'privacy': game.privacy,
                'player_one': game.player_one_object_id,
                'player_two': game.player_two_object_id,
                'winner_id': winner.id,
                'loser_id': loser.id,
                'winner': winner.username,
                'loser': loser.username,
                'spaces': game.spaces,
                'pw': game.password,
                'round': game.round,
            })
            return render(request, 'magic_fifteen_post.html', post)
    else:
        return HttpResponseRedirect(f'/magic_fifteen/')

def post_rematch(request):
    if request.method == 'POST':
        current_user = get_player(request)
        Game = get_app_model(request, 'game')
        p1 = Game.objects.filter(player_one_object_id=current_user.id, status='COMPLETED').first()
        p2 = Game.objects.filter(player_two_object_id=current_user.id, status='COMPLETED').first()

        game_to_rematch = p1 or p2

        if game_to_rematch:
            player_status = 'p1_status' if game_to_rematch == p1 else 'p2_status'
            setattr(game_to_rematch, player_status, 'REMATCH')
            game_to_rematch.save()

            other_player_status = 'p2_status' if game_to_rematch == p1 else 'p1_status'

            if getattr(game_to_rematch, other_player_status) == 'POST':
                create_rematch(game_to_rematch, p1)
                return HttpResponseRedirect('/magic_fifteen/lobby')
            elif getattr(game_to_rematch, other_player_status) == 'LEFT':
                create_new_lobby_game(current_user, game_to_rematch)
                return HttpResponseRedirect('/magic_fifteen/lobby')
            elif getattr(game_to_rematch, other_player_status) == 'REMATCH':
                handle_existing_rematch(game_to_rematch, p1)
                return HttpResponseRedirect('/magic_fifteen/lobby')
            else:
                return HttpResponseRedirect('/magic_fifteen/lobby')
        else:
            create_new_lobby_game(current_user)
            return HttpResponseRedirect('/magic_fifteen/lobby')

def create_rematch(game, is_player_one):
    if game.winner == 0 and game.loser == 0:
        new_player_id = game.player_one_object_id if is_player_one else game.player_two_object_id
        new_player_content_type = game.player_one_content_type if is_player_one else game.player_two_content_type
    elif game.winner == (game.player_one_object_id if is_player_one else game.player_two_object_id):
        new_player_id = game.winner
        new_player_content_type = game.player_one_content_type if is_player_one else game.player_two_content_type
    else:
        new_player_id = game.loser
        new_player_content_type = game.player_one_content_type if is_player_one else game.player_two_content_type

    new_player = get_player_by_content_type(new_player_content_type, new_player_id)
    Game = game.__class__
    rematch_game = Game(
        status='REMATCH',
        player_one=(new_player if is_player_one else None),
        p1_status=('REMATCH' if is_player_one else 'LOBBY'),
        player_two=(None if is_player_one else new_player),
        p2_status=('LOBBY' if is_player_one else 'REMATCH'),
        round=0,
        winner=0,
        loser=0,
        privacy=game.privacy,
        password=game.password,
        plays=[],
        spaces=[0, 0, 0, 0, 0, 0, 0, 0, 0],
    )
    rematch_game.save()

def create_new_lobby_game(request, cu, game = None):
    Game = game.__class__
    new_game = Game(
        status='LOBBY',
        player_one=cu,
        p1_status='LOBBY',
        player_two=None,
        p2_status='LOBBY',
        round=0,
        winner=0,
        loser=0,
        privacy='Public',
        plays=[],
        spaces=[0,0,0,0,0,0,0,0,0],
    )
    new_game.save()
    if game and game != None:
        game_archival(request, game.game_id)

def handle_existing_rematch(request, game, is_player_one):
    Game = get_app_model(request, 'game')
    rematch = Game.objects.filter(player_one_object_id=(game.player_two_object_id if is_player_one else game.player_one_object_id), status='REMATCH').first()
    rematch = rematch or Game.objects.filter(player_two_object_id=(game.player_two_object_id if is_player_one else game.player_one_object_id), status='REMATCH').first()
    if rematch:
        game_archival(request, game.game_id)
        if rematch.player_one is not None:
            rematch.player_two = game.player_one if is_player_one else game.player_two
            rematch.p2_status = 'REMATCH'
        else:
            rematch.player_one = game.player_one if is_player_one else game.player_two
            rematch.p1_status = 'REMATCH'
        rematch.status = 'READY'
        rematch.save()
    
def post_leave(request):
    if request.method == 'POST':
        current_user = get_player(request)
        Game = get_app_model(request, 'game')
        player_one_game = Game.objects.filter(player_one_object_id=current_user.id, status='COMPLETED').first()
        player_two_game = Game.objects.filter(player_two_object_id=current_user.id, status='COMPLETED').first()

        if player_one_game:
            handle_leave(player_one_game, True)
        elif player_two_game:
            handle_leave(player_two_game, False)
        return HttpResponseRedirect('/magic_fifteen')

def handle_leave(request, game, is_player_one):
    if is_player_one:
        game.p1_status='LEFT'
    else:
        game.p2_status='LEFT'
    game.save()

    if is_player_one and game.p2_status == 'REMATCH' or not is_player_one and game.p1_status == 'REMATCH':
        Game = game.__class__
        rematch = Game.objects.filter(player_one_object_id=(game.player_two_object_id if is_player_one else game.player_one_object_id), status='REMATCH').first()
        if rematch:
            rematch.status='LOBBY'
            rematch.save()
    # if game.p1_status in ['LEFT', 'REMATCH'] and game.p2_status in ['LEFT', 'REMATCH']:
    game_archival(request, game.game_id)
