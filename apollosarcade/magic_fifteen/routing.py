from django.urls import re_path
from magic_fifteen.consumers import GameConsumer, LobbyConsumer, PostConsumer
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

websocket_urlpatterns = [
    re_path(r'^magic_fifteen/ws/game/(?P<game_id>\w+)/$', GameConsumer.as_asgi()),
    re_path(r'^magic_fifteen/ws/lobby/(?P<lobby_id>\w+)/$', LobbyConsumer.as_asgi()),
    re_path(r'^magic_fifteen/ws/post/(?P<post_id>\w+)/$', PostConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    # ...
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})