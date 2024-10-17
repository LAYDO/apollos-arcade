from django.shortcuts import render
from django.http import JsonResponse
import os

DEVELOPMENT_MODE = os.environ.get("DEVELOPMENT_MODE", "False") == "True"

# Create your views here.
def capture(request):
    return render(request, 'capture_home.html',)