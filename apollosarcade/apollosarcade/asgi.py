"""
ASGI config for apollosarcade project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from magic_fifteen import routing as magic_fifteen_routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'apollosarcade.settings')
django.setup()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            # Your WebSocket URL routing here
            magic_fifteen_routing.websocket_urlpatterns
        )
    ),
})

