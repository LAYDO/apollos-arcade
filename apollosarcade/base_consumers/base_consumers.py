# base_consumers.py

import json
import traceback
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.apps import apps
from django.contrib.auth.models import User, AnonymousUser
from django.contrib.contenttypes.models import ContentType
from guest.models import Guest

class BaseConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        print(f"Connected to instance")

    async def disconnect(self, close_code):
        print('Disconnected')

    async def receive_json(self, response):
        # Handle incoming messages, to be implemented by subclasses.
        # Default print statement for debugging.
        print('Received message', response)
        if isinstance(response, str):
            try:
                response = json.loads(response)
            except json.JSONDecodeError:
                traceback.print_exc()
                return

    async def send_message(self, event):
        await self.send_json(event['message'])

    async def send_redirect(self, event):
        await self.send_json({
            'payload': {
                'type': 'redirect',
                'url': event['message']['url'],
                'reason': event['message']['reason'],
            }
        })

    async def error_message(self, event):
        await self.send(
            text_data=json.dumps(
                {"payload": {"type": "error", "error": event["message"]}}
            )
        )

    @database_sync_to_async
    def get_game_instance(self, id):
        app = self.scope["path"].split("/")[1]
        Game = apps.get_model(app, "Game")
        try:
            return Game.objects.get(game_id=id)
        except Game.DoesNotExist:
            return None

    @database_sync_to_async
    def save_game(self, instance):
        instance.save()
        print(f"Instance saved: {instance}")

    @database_sync_to_async
    def get_player_one(self, game):
        return game.player_one

    @database_sync_to_async
    def get_player_two(self, game):
        return game.player_two

class BaseGameConsumer(BaseConsumer):
    async def connect(self):
        try:
            self.game_id = self.scope['url_route']['kwargs']['game_id']
            self.game_group_id = 'game_%s' % self.game_id

            await self.channel_layer.group_add(
                self.game_group_id,
                self.channel_name
            )
            await self.accept()
            await super().connect()
        except Exception as e:
            print(f"Exception in connect: {e}")

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(
                self.game_group_id, self.channel_name
            )
            await super().disconnect(close_code)
        except Exception as e:
            print(f"Exception in disconnect: {e}")

    def check_win(self, game):
        # Check for win condition, to be implemented by subclasses.
        pass

    @database_sync_to_async
    def get_winner_name(self, game):
        if (game.winner == game.player_one_object_id):
            winner = game.player_one
        else:
            winner = game.player_two
        if (str(ContentType.objects.get_for_model(winner)) == 'auth | user'):
            return User.objects.get(id=game.winner).username
        else:
            return Guest.objects.get(id=game.winner).username

class BaseLobbyConsumer(BaseConsumer):
    async def connect(self):
        try:
            print(f'Connecting to lobby {self.scope["url_route"]["kwargs"]["game_id"]}')
            self.lobby_id = self.scope['url_route']['kwargs']['game_id']
            self.lobby_group_id = 'lobby_%s' % self.lobby_id
            print(f'Lobby group ID: {self.lobby_group_id}')
            await self.channel_layer.group_add(
                self.lobby_group_id,
                self.channel_name
            )
            print(f'Added channel to lobby group')
            await self.accept()
            print(f'Accepted connection')
            await super().connect()
        except Exception as e:
            print(f"Exception in connect: {e}")

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(
                self.lobby_group_id, self.channel_name
            )
            print(f'Discarded channel from lobby group')
            await super().disconnect(close_code)
        except Exception as e:
            print(f"Exception in disconnect: {e}")

    async def send_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "payload": {
                        "type": "update",
                        "id": event["message"]["id"],
                        "status": event["message"]["status"],
                        "p1": event["message"]["p1"],
                        "p2": event["message"]["p2"],
                        "p1ID": event["message"]["p1ID"],
                        "p2ID": event["message"]["p2ID"],
                        "p1Status": event["message"]["p1Status"],
                        "p2Status": event["message"]["p2Status"],
                        "privacy": event["message"]["privacy"],
                        "current": event["message"]["current"],
                        "round": event["message"]["round"],
                    },
                }
            )
        )

    async def send_leave(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "payload": {
                        "type": "leave",
                        "url": event["message"]["url"],
                        "reason": event["message"]["reason"],
                        "current": event["message"]["current"],
                    }
                }
            )
        )

    async def send_continue(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "payload": {
                        "type": "continue",
                        "url": event["message"]["url"],
                        "reason": event["message"]["reason"],
                        "current": event["message"]["current"],
                    }
                }
            )
        )

    async def error_message(self, event):
        await self.send(text_data=json.dumps(
                {
                    "payload": {
                        "type": "error",
                        "error": event["message"],
                    },
                }
            )
        )

    @database_sync_to_async
    def get_player_one(self, instance):
        player1 = None
        if instance.player_one != None:
            if (
                str(ContentType.objects.get_for_model(instance.player_one)).lower()
                == "auth | user"
            ):
                player1 = User.objects.get(id=instance.player_one_object_id)
            else:
                player1 = Guest.objects.get(id=instance.player_one_object_id)
        return player1

    @database_sync_to_async
    def get_player_two(self, instance):
        player2 = None
        if instance.player_two != None:
            if (
                str(ContentType.objects.get_for_model(instance.player_two)).lower()
                == "auth | user"
            ):
                player2 = User.objects.get(id=instance.player_two_object_id)
            else:
                player2 = Guest.objects.get(id=instance.player_two_object_id)
        return player2

    @database_sync_to_async
    def get_player_by_username(self, user, instance):
        try:
            if user.is_authenticated:
                # This is an authenticated user.
                return User.objects.get(username=user.username)
            elif isinstance(user, AnonymousUser):
                # This is a guest.
                if ContentType.objects.get_for_model(
                    instance.player_one
                ) == ContentType.objects.get_for_model(Guest):
                    return Guest.objects.get(id=instance.player_one_object_id)
                elif ContentType.objects.get_for_model(
                    instance.player_two
                ) == ContentType.objects.get_for_model(Guest):
                    return Guest.objects.get(id=instance.player_two_object_id)
            else:
                # This is an unexpected situation, handle accordingly.
                pass
        except User.DoesNotExist:
            raise Exception("Player not found")
        except Guest.DoesNotExist:
            raise Exception("Player not found")

class BasePostConsumer(BaseLobbyConsumer):
    async def connect(self):
        try:
            self.post_id = self.scope['url_route']['kwargs']['game_id']
            self.post_group_id = 'post_%s' % self.post_id

            await self.channel_layer.group_add(
                self.post_group_id,
                self.channel_name
            )
            await self.accept()
        except Exception as e:
            print(f"Exception in connect: {e}")

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(
                self.post_group_id, self.channel_name
            )
        except Exception as e:
            print(f"Exception in disconnect: {e}")

    async def send_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "payload": {
                        "type": "update",
                        "p1Status": event["message"]["p1Status"],
                        "p2Status": event["message"]["p2Status"],
                    },
                }
            )
        )
