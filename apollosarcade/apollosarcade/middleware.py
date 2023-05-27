from django.utils import timezone
from guest.models import Guest

class GuestMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.user.is_authenticated:
            guest_id = request.session.get('guest_id')
            try:
                guest = Guest.objects.get(id=guest_id)
                guest.last_active = timezone.now()
                guest.save()
            except Guest.DoesNotExist:
                guest, created = Guest.objects.get_or_create(id=guest_id, defaults={'username': Guest.generate_guest_name()})
                request.session['guest_id'] = guest.id
        response = self.get_response(request)
        return response