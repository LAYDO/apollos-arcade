import os
from django.conf import settings
from rest_framework import generics
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .forms import UserProfileForm
from .serializers import UserSerializer

class UserProfileList(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserProfileDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

@login_required
def profile(request):
    return render(request, 'profile.html', {
        'userprofile': request.user.userprofile,
        'media_url': settings.MEDIA_ROOT #os.getenv('MEDIA_ROOT') # f'{os.getenv("DO_SPACES_ENDPOINT_URL")}/apollosarcade/static/images/' 
    })

@login_required
def edit_profile(request):
    if request.method == 'POST':
        form = UserProfileForm(request.POST, request.FILES, instance=request.user.userprofile)
        if form.is_valid():
            form.save()
            return redirect('player')
    else:
        form = UserProfileForm(instance=request.user.userprofile)
    return render(request, 'edit_profile.html', {'form': form})
