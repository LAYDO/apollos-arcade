from django.urls import path

from . import views
from local import views as local_views
from game import views as game_views
from lobby import views as lobby_views
from home import views as home_views
from start import views as start_views
from post import views as post_views

urlpatterns = [
    path('', views.capture, name='capture'),
    path('local/', local_views.local, name='local'),
    path('multiplayer/', home_views.check_for_match, name='check_for_match'),
    path('start/', start_views.start, name='start'),
    path('start/create', lobby_views.create_lobby, name='create_lobby'),
    path('start/join', lobby_views.join_lobby, name='join_lobby'),
    path('lobby/<game_id>', lobby_views.lobby, name='lobby'),
    path('game/<game_id>', game_views.game, name='game'),
    path('post/<game_id>', post_views.post, name='post'),
    path('how-to-play/', home_views.how_to_play, name='how_to_play'),
]