from django.shortcuts import render

# Create your views here.
def capture(request):
    return render(request, 'capture_home.html',)