from django.apps import apps
from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType

from guest.models import Guest
from apollosarcade.utils import get_player, get_app_model
from apollosarcade.error_handler import GameError


# Create your views here.
def game(request, game_id):
    current_user = get_player(request)
    app = request.path.split('/')[1]
    model_name = 'game'
    game = {}
    try:
        model = get_app_model(request, model_name)
        match = model.objects.get(game_id=game_id)
        if (match.status == 'COMPLETED' or match.round == 10):
            return HttpResponseRedirect(f'/{app}/post')
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
        return render(request, f'{app}_game.html', game)
    except GameError as e:
        return JsonResponse({'error': e.message}, status=e.status)
