from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from django.shortcuts import render

from .models import Game
from .views import game_archival, get_games

@login_required
def post(request):
    current_user = request.user
    post = {}
    lobbies = get_games(current_user, ['LOBBY','REMATCH'], [])
    if len(lobbies) > 0:
        return HttpResponseRedirect(f'/magic_fifteen/lobby')
    games = get_games(current_user, ['COMPLETED'], [])
    if (len(games) == 1):
        game = Game.objects.get(game_id=games[0].game_id)
        if (game):
            if (game.round == 10 and game.winner == 0 and game.loser == 0):
                winner = User.objects.get(id=game.player_one_id)
                loser = User.objects.get(id=game.player_two_id)
            else:
                winner = User.objects.get(id=game.winner)
                loser = User.objects.get(id=game.loser)
            post.update({
                'id': game.game_id,
                'privacy': game.privacy,
                'player_one': game.player_one_id,
                'player_two': game.player_two_id,
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

@login_required
def post_rematch(request):
    if request.method == 'POST':
        current_user = request.user
        p1 = Game.objects.filter(player_one=current_user, status='COMPLETED').first()
        p2 = Game.objects.filter(player_two=current_user, status='COMPLETED').first()

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
                create_new_lobby_game(game_to_rematch, current_user)
                return HttpResponseRedirect('/magic_fifteen/lobby')
            elif getattr(game_to_rematch, other_player_status) == 'REMATCH':
                handle_existing_rematch(game_to_rematch, p1)
                return HttpResponseRedirect('/magic_fifteen/lobby')
            else:
                return HttpResponseRedirect('/magic_fifteen/lobby')

def create_rematch(game, is_player_one):
    if game.winner == 0 and game.loser == 0:
        new_player_id = game.player_one_id if is_player_one else game.player_two_id
    elif game.winner == (game.player_one_id if is_player_one else game.player_two_id):
        new_player_id = game.winner
    else:
        new_player_id = game.loser

    new_player = User.objects.get(id=new_player_id)

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
    # return HttpResponseRedirect('/magic_fifteen/lobby')

def create_new_lobby_game(game, cu):
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
    game_archival(game.game_id)
    # return HttpResponseRedirect('/magic_fifteen/lobby')


def handle_existing_rematch(game, is_player_one):
    rematch = Game.objects.filter(player_one=(game.player_two if is_player_one else game.player_one), status='REMATCH').first()
    rematch = rematch or Game.objects.filter(player_two=(game.player_two if is_player_one else game.player_one), status='REMATCH').first()
    if rematch:
        game_archival(game.game_id)
        if rematch.player_one is not None:
            rematch.player_two = game.player_one if is_player_one else game.player_two
            rematch.p2_status = 'REMATCH'
        else:
            rematch.player_one = game.player_one if is_player_one else game.player_two
            rematch.p1_status = 'REMATCH'
        rematch.status = 'READY'
        rematch.save()
        # return HttpResponseRedirect('/magic_fifteen/lobby')
    
@login_required
def post_leave(request):
    if request.method == 'POST':
        current_user = request.user
        player_one_game = Game.objects.filter(player_one=current_user, status='COMPLETED').first()
        player_two_game = Game.objects.filter(player_two=current_user, status='COMPLETED').first()

        if player_one_game:
            handle_leave(player_one_game, True)
        elif player_two_game:
            handle_leave(player_two_game, False)
        return HttpResponseRedirect('/magic_fifteen')

def handle_leave(game, is_player_one):
    if is_player_one:
        game.p1_status='LEFT'
    else:
        game.p2_status='LEFT'
    game.save()

    if is_player_one and game.p2_status == 'REMATCH' or not is_player_one and game.p1_status == 'REMATCH':
        rematch = Game.objects.filter(player_one=(game.player_two if is_player_one else game.player_one), status='REMATCH').first()
        if rematch:
            rematch.status='LOBBY'
            rematch.save()
    if game.p1_status in ['LEFT', 'REMATCH'] and game.p2_status in ['LEFT', 'REMATCH']:
        game_archival(game.game_id)
