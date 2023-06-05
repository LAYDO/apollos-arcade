from django.apps import apps
from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType

from guest.models import Guest
from apollosarcade.utils import get_player
from apollosarcade.error_handler import GameError


# Create your views here.
def game(request, game_id):
    current_user = get_player(request)
    app = request.path.split('/')[1]
    model_name = 'game'
    game = {}
    try:
        app_config = apps.get_app_config(app)
        model = app_config.get_model(model_name)
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
    
def game_leave(request, game_id):
    if request.method == 'POST':
        current_user = get_player(request)
        app = request.path.split('/')[1]
        model_name = 'game'
        try:
            app_config = apps.get_app_config(app)
            model = app_config.get_model(model_name)
            match = model.objects.get(game_id=game_id)
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
            return HttpResponseRedirect(f'/{app}')
        except GameError as e:
            return JsonResponse({'error': e.message}, status=e.status)