from django.shortcuts import render
from guest.models import Guest
from apollosarcade.utils import get_player

# Create your views here.
def start(request):
    context = {}
    current_user = get_player(request)
    app = request.path.split('/')[1]
    if (current_user.__class__ == Guest):
        context.update({
            'guest': True,
        })
    else:
        context.update({
            'guest': False,
        })
    return render(request, f'{app}_start.html', context)