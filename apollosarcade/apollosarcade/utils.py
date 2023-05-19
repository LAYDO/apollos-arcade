from .models import Guest

def get_player(request):
    if request.user.is_authenticated:
        return request.user
    else:
        guest_id = request.session.get('guest_id')
        if guest_id:
            return Guest.objects.get(id=guest_id)
        else:
            guest = Guest.objects.create()
            request.session['guest_id'] = guest.id
            return guest