from django.urls import re_path
from capture.consumers import GameConsumer, LobbyConsumer, PostConsumer
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

websocket_urlpatterns = [
    re_path(r'^capture/ws/game/(?P<game_id>\w+)/$', GameConsumer.as_asgi()),
    re_path(r'^capture/ws/lobby/(?P<game_id>\w+)/$', LobbyConsumer.as_asgi()),
    re_path(r'^capture/ws/post/(?P<game_id>\w+)/$', PostConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})