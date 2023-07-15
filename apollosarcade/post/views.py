from django.http import HttpResponseRedirect
from django.shortcuts import render

from apollosarcade.utils import get_player, get_player_by_content_type, game_archival, get_games, get_app_model

def post(request, game_id):
    app = request.path.split('/')[1]
    current_user = get_player(request)
    post = {}
    lobbies = get_games(request, ['LOBBY','REMATCH'], [])
    if len(lobbies) > 0:
        return HttpResponseRedirect(f'/{app}/lobby')
    Game = get_app_model(request, 'game')
    game = Game.objects.get(game_id=game_id)
    if (game and game.status == 'COMPLETED'):
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
            'current': current_user.id,
        })
        return render(request, f'{app}_post.html', post)
    else:
        return HttpResponseRedirect(f'/{app}/')
