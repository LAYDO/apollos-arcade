from django.contrib.auth.models import User
from guest.models import Guest

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