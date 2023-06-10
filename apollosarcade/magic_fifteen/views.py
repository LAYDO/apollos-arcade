from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.http.response import JsonResponse
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django import template

register = template.Library()
# Create your views here.

# Default view, auth only superusers
def magic_fifteen(request):
    return render(request, 'magic_fifteen_home.html',)

