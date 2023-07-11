from django.urls import path

from . import views

urlpatterns = [
    path('', views.capture, name='capture'),
]