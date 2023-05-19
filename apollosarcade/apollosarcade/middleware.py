from .models import Guest

class GuestMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.user.is_authenticated:
            guest_id = request.session.get('guest_id')
            if not guest_id:
                guest = Guest.objects.create()
                request.session['guest_id'] = guest.id
        response = self.get_response(request)
        return response