from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.
def capture(request):
    return render(request, 'capture_home.html',)