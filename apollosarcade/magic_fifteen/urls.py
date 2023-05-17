from django.urls import path

from . import views, post_views

urlpatterns = [
    path('', views.magic_fifteen, name='magic_fifteen'),
    path('local/', views.local, name='local'),
    path('check/', views.check_for_match, name='check_for_match'),
    path('start/', views.start, name='start'),
    path('start/create', views.create_lobby, name='create_lobby'),
    path('start/join', views.join_lobby, name='join_lobby'),
    path('lobby/', views.lobby, name='lobby'),
    path('lobby/leave', views.lobby_leave, name='lobby_leave'),
    path('lobby/start', views.game_start_continue, name='game_start_continue'),
    path('clicked/', views.user_click, name='user_click'),
    path('game/<game_id>', views.game, name='game'),
    path('game/<game_id>/leave', views.game_leave, name='game_leave'),
    path('post/', post_views.post, name='post'),
    path('post/rematch', post_views.post_rematch, name='post_rematch'),
    path('post/leave', post_views.post_leave, name='post_leave'),
    path('how-to-play/', views.how_to_play, name='how_to_play'),
]