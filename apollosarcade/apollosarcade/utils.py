from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.apps import apps
from guest.models import Guest
from django.db.models import Q

def get_player(request):
    try:
        if request.user.is_authenticated:
            return request.user
        else:
            guest_id = request.session.get('guest_id')
            if guest_id:
                return Guest.objects.get(id=guest_id)
            else:
                raise Exception('Guest not found')
    except:
        raise Exception('Player not found')
    
def get_player_by_content_type(content_type, object_id):
    try:
        model_class = content_type.model_class()
        if model_class == User:
            return User.objects.get(id=object_id)
        elif model_class == Guest:
            return Guest.objects.get(id=object_id)
        else:
            raise Exception('Player not found')
    except:
        raise Exception('Player not found')
    
def get_player_by_id(player_id):
    try:
        return User.objects.get(id=player_id)
    except User.DoesNotExist:
        try:
            return Guest.objects.get(id=player_id)
        except Guest.DoesNotExist:
            raise Exception('Player not found')
        
def get_app_model(request, model_name):
    try:
        app = request.path.split('/')[1]
        app_config = apps.get_app_config(app)
        model = app_config.get_model(model_name)
        return model
    except:
        raise Exception('Model not found')
    

def get_games(request, status=None, exclude_status=None, player_field=None):
    user = get_player(request)
    user_content_type = ContentType.objects.get_for_model(user)
    Game = get_app_model(request, 'game')
    games = Game.objects.filter((Q(player_one_content_type=user_content_type) & Q(player_one_object_id=user.id)) | (Q(player_two_content_type=user_content_type) & Q(player_two_object_id=user.id)))
    if status:
        games = games.filter(status__in=status)
    if exclude_status:
        games = games.exclude(status__in=exclude_status)
    if player_field:
        games = games.filter(**{player_field: user})
    return games

def game_archival(request, id):
    Game = get_app_model(request, 'game')
    to_be_archived = Game.objects.get(game_id=id)
    to_be_archived.status = 'ARCHIVE'
    to_be_archived.save()