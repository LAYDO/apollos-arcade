from django.urls import re_path
from magic_fifteen.consumers import MagicFifteenConsumer
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

websocket_urlpatterns = [
    re_path(r'^ws/game/(?P<game_id>\w+)/$', MagicFifteenConsumer.as_asgi()),
]


application = ProtocolTypeRouter({
    # ...
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})