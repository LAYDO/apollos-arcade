from django.urls import path

from . import views, views_post, views_lobby
from local import views as local_views
from game import views as game_views

urlpatterns = [
    path('', views.magic_fifteen, name='magic_fifteen'),
    path('local/', local_views.local, name='local'),
    path('check/', views.check_for_match, name='check_for_match'),
    path('start/', views.start, name='start'),
    path('start/create', views_lobby.create_lobby, name='create_lobby'),
    path('start/join', views_lobby.join_lobby, name='join_lobby'),
    path('lobby/', views_lobby.lobby, name='lobby'),
    path('lobby/leave', views_lobby.lobby_leave, name='lobby_leave'),
    path('lobby/start', views.game_start_continue, name='game_start_continue'),
    path('game/<game_id>', game_views.game, name='game'),
    path('game/<game_id>/leave', game_views.game_leave, name='game_leave'),
    path('post/', views_post.post, name='post'),
    path('post/rematch', views_post.post_rematch, name='post_rematch'),
    path('post/leave', views_post.post_leave, name='post_leave'),
    path('how-to-play/', views.how_to_play, name='how_to_play'),
]