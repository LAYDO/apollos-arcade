from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.
def capture(request):
    return JsonResponse({'capture': 'Coming Soon!'})
    # return render(request, 'capture_home.html',)