from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
import traceback

from guest.models import Guest
from apollosarcade.utils import get_player, get_app_model
from apollosarcade.error_handler import GameError


# Create your views here.
def game(request, game_id):
    try:
        current_user = get_player(request)
        app = request.path.split('/')[1]
        model_name = 'game'
        game = {}
        
        model = get_app_model(request, model_name)
        match = model.objects.get(game_id=game_id)
        
        if (match.status == 'COMPLETED' or match.round == 10):
            return HttpResponseRedirect(f'/{app}/post')
            
        if (current_user == match.player_one):
            try:
                content_type = ContentType.objects.get_for_model(match.player_two)
                
                if (str(content_type) == 'auth | user'):
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
            except Exception as e:
                raise
                
        elif (current_user == match.player_two):
            try:
                content_type = ContentType.objects.get_for_model(match.player_one)
                
                if (str(content_type) == 'auth | user'):
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
            except Exception as e:
                raise
        else:
            raise Exception('User is not a player in this game')
            
        # Add base game info that's common to all games
        game.update({
            'id': game_id,
            'privacy': match.privacy,
            'round': match.round,
            'current': current_user.id,
        })

        # Dynamically add all serializable attributes from the match object
        excluded_attrs = {
            'id', 'privacy', 'round', 'current', 'player_one', 'player_two',  # already added
            'objects', 'DoesNotExist', 'MultipleObjectsReturned',  # Django model attributes
            'save', 'delete', 'clean', 'full_clean', 'refresh_from_db',  # Django model methods
        }
        
        # Get model fields instead of using dir()
        for field in match._meta.get_fields():
            field_name = field.name
            if field_name not in excluded_attrs:
                try:
                    value = getattr(match, field_name)
                    # Check if the value is JSON serializable (basic Python types)
                    if isinstance(value, (str, int, float, bool, list, dict, type(None))):
                        game[field_name] = value
                except Exception as e:
                    print(f'Error processing field {field_name}: {str(e)}')

        return render(request, f'{app}_game.html', game)
        
    except GameError as e:
        print(f'GameError: {e.message} (Status: {e.status})')
        return JsonResponse({'error': e.message}, status=e.status)
    except Exception as e:
        print(f'Unexpected error in game view: {str(e)}')
        print(f'Full traceback: {traceback.format_exc()}')
        return JsonResponse({'error': str(e)}, status=500)
