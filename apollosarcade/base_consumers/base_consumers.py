# base_consumers.py

import json
import traceback
import asyncio
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.apps import apps
from django.contrib.auth.models import User, AnonymousUser
from django.contrib.contenttypes.models import ContentType
from guest.models import Guest
from django.utils import timezone

@dataclass
class GameState:
    spaces: List[int]
    round: int
    plays: List[int]

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
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.game_lock = asyncio.Lock()

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

    async def handle_win(self, game, play: int):
        game.status = 'COMPLETED'
        game.p1_status = 'POST'
        game.p2_status = 'POST'
        if play % 2 == 0:
            game.winner = game.player_two_object_id
            game.loser = game.player_one_object_id
        else:
            game.winner = game.player_one_object_id
            game.loser = game.player_two_object_id
        game.ended = str(await database_sync_to_async(timezone.now)())
        await self.save_game(game)
        winner = await self.get_winner_name(game)
        await self.channel_layer.group_send(
            self.game_group_id, {
                'type': 'send_redirect',
                'message': {
                    'url': f'/{self.scope["path"].split("/")[1]}/post/{game.game_id}',
                    'reason': f'{winner} wins!',
                }
            }
        )

    async def handle_tie(self, game):
        game.status = 'COMPLETED'
        game.p1_status = 'POST'
        game.p2_status = 'POST'
        game.winner = 0
        game.loser = 0
        game.ended = str(await database_sync_to_async(timezone.now)())
        await self.save_game(game)
        await self.channel_layer.group_send(
            self.game_group_id, {
                'type': 'send_redirect',
                'message': {
                    'url': f'/{self.scope["path"].split("/")[1]}/post/{game.game_id}',
                    'reason': 'Tie game!',
                }
            }
        )

    async def broadcast_game_state(self, game, user_id: int):
        p1 = await self.get_player_one(game)
        p2 = await self.get_player_two(game)

        await self.channel_layer.group_send(
            self.game_group_id, {
                'type': 'send_message',
                'message': {
                    'spaces': game.spaces,
                    'round': game.round,
                    'plays': game.plays,
                    'p1': p1.id if p1 else None,
                    'p2': p2.id if p2 else None,
                    'current': user_id,
                }
            })

    async def handle_error(self, e: Exception, response: Dict[str, Any]):
        tb_str = traceback.format_exception(type(e), e, e.__traceback__)
        tb_str = ''.join(tb_str)

        message = response.get('message', {})
        await self.channel_layer.group_send(
            self.game_group_id, {
                'type': 'error_message',
                'message': f"User: {message.get('user_id')}\nError: {str(e)}\nTraceback:\n{tb_str}",
            })

    async def handle_non_move_message(self, response: Dict[str, Any]):
        if response['type'] == 'heartbeat':
            await self.send(text_data=json.dumps({
                'type': 'heartbeat'
            }))

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
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.lobby_lock = asyncio.Lock()

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

    async def broadcast_lobby_state(self, lobby, user_id: int):
        p1 = await self.get_player_one(lobby)
        p2 = await self.get_player_two(lobby)
        await self.channel_layer.group_send(
            self.lobby_group_id, {
                'type': 'send_message',
                'message': {
                    'id': lobby.game_id,
                    'status': lobby.status,
                    'p1': p1.username if p1 else None,
                    'p2': p2.username if p2 else None,
                    'p1ID': lobby.player_one_object_id,
                    'p2ID': lobby.player_two_object_id,
                    'p1Status': lobby.p1_status,
                    'p2Status': lobby.p2_status,
                    'privacy': lobby.privacy,
                    'current': user_id,
                    'round': lobby.round,
                }
            })

    async def handle_ready(self, lobby: Any, user_id: int) -> None:
        async with self.lobby_lock:
            if lobby.status not in ['LOBBY', 'REMATCH']:
                raise ValueError('Invalid lobby status for ready action')

            is_p1 = lobby.player_one_object_id == user_id
            is_p2 = lobby.player_two_object_id == user_id
            if not (is_p1 or is_p2):
                raise ValueError('User not in this lobby')

            if is_p1:
                lobby.p1_status = 'IN-GAME' if lobby.p2_status == 'READY' else 'READY'
                if lobby.p2_status == 'READY':
                    lobby.p2_status = 'IN-GAME'
            else:
                lobby.p2_status = 'IN-GAME' if lobby.p1_status == 'READY' else 'READY'
                if lobby.p1_status == 'READY':
                    lobby.p1_status = 'IN-GAME'

            if lobby.p1_status == 'IN-GAME' and lobby.p2_status == 'IN-GAME':
                lobby.status = 'IN-GAME'
                lobby.round = 1

            await self.save_game(lobby)

    async def handle_leave(self, lobby: Any, user_id: int) -> None:
        async with self.lobby_lock:
            if lobby.status == 'IN-GAME':
                if lobby.player_one_object_id == user_id:
                    lobby.winner = lobby.player_two_object_id
                    lobby.loser = lobby.player_one_object_id
                    lobby.p1_status = 'ABANDONED'
                    lobby.p2_status = 'POST'
                else:
                    lobby.winner = lobby.player_one_object_id
                    lobby.loser = lobby.player_two_object_id
                    lobby.p2_status = 'ABANDONED'
                    lobby.p1_status = 'POST'
                lobby.status = 'COMPLETED'
            elif lobby.status == 'LOBBY':
                if lobby.player_one_object_id == user_id:
                    lobby.player_one = None
                    lobby.p1_status = 'UNREADY'
                else:
                    lobby.player_two = None
                    lobby.p2_status = 'UNREADY'
            
            await self.save_game(lobby)

    async def handle_error(self, e: Exception, response: Dict[str, Any]):
        tb_str = traceback.format_exception(type(e), e, e.__traceback__)
        tb_str = ''.join(tb_str)
        message = response.get('message', {})
        await self.channel_layer.group_send(
            self.lobby_group_id, {
                'type': 'error_message',
                'message': f"User: {message.get('user_id')}\nError: {str(e)}\nTraceback:\n{tb_str}",
            })

class BasePostConsumer(BaseLobbyConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.post_lock = asyncio.Lock()

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

    async def handle_rematch(self, game: Any, user_id: int) -> None:
        async with self.post_lock:
            if game.player_one_object_id == user_id:
                game.p1_status = 'REMATCH'
            elif game.player_two_object_id == user_id:
                game.p2_status = 'REMATCH'
            else:
                raise ValueError('User not in this game')

            await self.save_game(game)

            if game.p1_status == 'REMATCH' and game.p2_status == 'REMATCH':
                await self.create_rematch_game(game)

    async def create_rematch_game(self, game: Any) -> None:
        game.status = 'ARCHIVE'
        await self.save_game(game)

        if game.player_one_object_id == game.winner:
            player_one = await self.get_player_one(game)
            player_two = await self.get_player_two(game)
        else:
            player_one = await self.get_player_two(game)
            player_two = await self.get_player_one(game)

        Game = game.__class__
        rematch_game = Game(
            status='IN-GAME',
            player_one=player_one,
            p1_status='IN-GAME',
            player_two=player_two,
            p2_status='IN-GAME',
            winner=0,
            loser=0,
            privacy=game.privacy,
            password=game.password,
            plays=[],
            spaces=[0] * 9,
        )
        await self.save_game(rematch_game)
        
        await self.channel_layer.group_send(
            self.post_group_id, {
                'type': 'send_redirect',
                'message': {
                    'url': f'/{self.scope["path"].split("/")[1]}/game/{rematch_game.game_id}',
                    'reason': 'Rematch beginning...',
                }
            }
        )
    
    async def handle_leave(self, game: Any, user_id: int) -> None:
        async with self.post_lock:
            if game.status == 'COMPLETED':
                if game.player_one_object_id == user_id:
                    game.p1_status = 'LEFT'
                    player_left = await self.get_player_one(game)
                else:
                    game.p2_status = 'LEFT'
                    player_left = await self.get_player_two(game)
                game.status = 'ARCHIVE'
            await self.save_game(game)
            await self.channel_layer.group_send(
                self.post_group_id, {
                    'type': 'send_redirect',
                    'message': {
                        'url': f'/{self.scope["path"].split("/")[1]}',
                        'reason': f'{player_left.username} left the game...',
                    }
                }
            )

    async def handle_error(self, e: Exception, response: Dict[str, Any]):
        tb_str = traceback.format_exception(type(e), e, e.__traceback__)
        tb_str = ''.join(tb_str)
        message = response.get('message', {})
        await self.channel_layer.group_send(
            self.post_group_id, {
                'type': 'error_message',
                'message': f"User: {message.get('user_id')}\nError: {str(e)}\nTraceback:\n{tb_str}",
            })
