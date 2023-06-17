from django.shortcuts import render
from django import template

register = template.Library()

def magic_fifteen(request):
    return render(request, 'magic_fifteen_home.html',)

