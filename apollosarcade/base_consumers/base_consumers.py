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
from abc import ABC, abstractmethod

class GameStateMixin:
    """Mixin for managing game state transitions and validation"""
    @abstractmethod
    async def validate_state_transition(self, current_state: str, new_state: str) -> bool:
        """Validate if a state transition is allowed"""
        pass

    @abstractmethod
    async def transition_state(self, new_state: str) -> None:
        """Perform state transition and related actions"""
        pass

class LockingMixin:
    """Mixin providing async locking functionality"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._lock = asyncio.Lock()

    async def with_lock(self, func, *args, **kwargs):
        async with self._lock:
            return await func(*args, **kwargs)

class PlayerManagementMixin:
    """Mixin for player-related operations"""
    @database_sync_to_async
    def get_player(self, user_id: int, model_type: str = None):
        if model_type == "user":
            return User.objects.get(id=user_id)
        elif model_type == "guest":
            return Guest.objects.get(id=user_id)
        else:
            # Try both types
            try:
                return User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Guest.objects.get(id=user_id)

    @database_sync_to_async
    def get_player_by_username(self, user, game):
        """Get player object from username, handling both User and Guest types"""
        try:
            if user.is_authenticated:
                return User.objects.get(username=user.username)
            elif isinstance(user, AnonymousUser):
                if ContentType.objects.get_for_model(game.player_one) == ContentType.objects.get_for_model(Guest):
                    return Guest.objects.get(id=game.player_one_object_id)
                elif ContentType.objects.get_for_model(game.player_two) == ContentType.objects.get_for_model(Guest):
                    return Guest.objects.get(id=game.player_two_object_id)
            else:
                return None
        except (User.DoesNotExist, Guest.DoesNotExist) as e:
            print(f"Full traceback: {traceback.format_exc()}")
            return None
        except Exception as e:
            print(f"Full traceback: {traceback.format_exc()}")
            return None

class BroadcastMixin:
    """Mixin for broadcasting game updates"""
    async def broadcast_to_group(self, group_id: str, message_type: str, payload: Dict):
        """Broadcast a message to a channel group"""
        message = {
            'type': message_type,
            'message': payload
        }
        await self.channel_layer.group_send(group_id, message)

    async def send_message(self, event):
        """Handle sending messages to WebSocket, wrapping the message in 'payload'."""
        client_payload = event['message']
        message_to_send = {
            'payload': client_payload
        }
        await self.send(text_data=json.dumps(message_to_send))

    async def broadcast_lobby_state(self, lobby: Any, user: Any):
        """Broadcast the current state of the lobby to all connected users"""
        try:
            p1 = await self.get_player_one(lobby)
            p2 = await self.get_player_two(lobby)
            
            # Get user ID safely
            current_id = None
            if user:
                try:
                    current_id = user.id
                except AttributeError:
                    pass
            
            # Construct the payload for the client, including the 'type'
            client_payload = {
                'type': 'update', # Add the type expected by the frontend
                'id': lobby.game_id,
                'status': lobby.status,
                'p1': p1.username if p1 else None,
                'p2': p2.username if p2 else None,
                'p1ID': lobby.player_one_object_id,
                'p2ID': lobby.player_two_object_id,
                'p1Status': lobby.p1_status,
                'p2Status': lobby.p2_status,
                'privacy': lobby.privacy,
                'current': current_id,
                'round': lobby.round,
            }
            
            await self.broadcast_to_group(
                self.lobby_group_id,
                'send_message',
                client_payload # Pass the constructed client payload
            )
        except Exception as e:
            print(f"Full traceback: {traceback.format_exc()}")

    async def broadcast_post_state(self, game: Any, user_id: int):
        try:
            p1 = await self.get_player_one(game)
            p2 = await self.get_player_two(game)
            
            client_payload = {
                'type': 'update',
                'id': game.game_id,
                'status': game.status,
                'p1': p1.username if p1 else None,
                'p2': p2.username if p2 else None,
                'p1ID': game.player_one_object_id,
                'p2ID': game.player_two_object_id,
                'p1Status': game.p1_status,
                'p2Status': game.p2_status,
                'privacy': game.privacy,
                'current': user_id,
                'round': game.round,
            }
            await self.broadcast_to_group(
                self.post_group_id,
                'send_message',
                client_payload
            )
        except Exception as e:
            print(f"Full traceback: {traceback.format_exc()}")
            

@dataclass
class GameState:
    spaces: List[int]
    round: int
    plays: List[int]

class BaseConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        pass

    async def disconnect(self, close_code):
        pass

    async def receive_json(self, response):
        if isinstance(response, str):
            try:
                response = json.loads(response)
            except json.JSONDecodeError:
                traceback.print_exc()
                return

    async def send_message(self, event):
        await self.send_json({
            'payload': event['message']
        })

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

    @database_sync_to_async
    def get_player_one(self, game):
        return game.player_one

    @database_sync_to_async
    def get_player_two(self, game):
        return game.player_two

class BaseGameConsumer(BaseConsumer, LockingMixin, GameStateMixin, PlayerManagementMixin, BroadcastMixin):
    """Base class for game-related WebSocket consumers"""
    
    VALID_STATE_TRANSITIONS = {
        'LOBBY': ['IN-GAME'],
        'IN-GAME': ['COMPLETED'],
        'COMPLETED': ['ARCHIVE'],
        'REMATCH': ['IN-GAME'],
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Explicitly initialize the lock here to ensure it exists
        self._lock = asyncio.Lock()

    async def validate_state_transition(self, current_state: str, new_state: str) -> bool:
        return new_state in self.VALID_STATE_TRANSITIONS.get(current_state, [])

    async def transition_state(self, game: Any, new_state: str) -> None:
        if not await self.validate_state_transition(game.status, new_state):
            raise ValueError(f"Invalid state transition from {game.status} to {new_state}")
        game.status = new_state
        await self.save_game(game)

    async def connect(self):
        try:
            self.game_id = self.scope['url_route']['kwargs']['game_id']
            self.game_group_id = f'game_{self.game_id}'
            
            await self.channel_layer.group_add(self.game_group_id, self.channel_name)
            await self.accept()
            await super().connect()
        except Exception as e:
            print(f"Full traceback: {traceback.format_exc()}")

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(self.game_group_id, self.channel_name)
            await super().disconnect(close_code)
        except Exception as e:
            print(f"Full traceback: {traceback.format_exc()}")

    @abstractmethod
    async def validate_move(self, game: Any, **kwargs) -> None:
        """Validate a game move"""
        pass

    @abstractmethod
    async def check_win(self, game: Any) -> bool:
        """Check if the current game state represents a win"""
        pass

    async def handle_win(self, game: Any, play: int):
        await self.transition_state(game, 'COMPLETED')
        game.p1_status = 'POST'
        game.p2_status = 'POST'
        
        # Determine winner
        if play % 2 == 0:
            game.winner = game.player_two_object_id
            game.loser = game.player_one_object_id
        else:
            game.winner = game.player_one_object_id
            game.loser = game.player_two_object_id
            
        game.ended = str(await database_sync_to_async(timezone.now)())
        await self.save_game(game)
        
        winner = await self.get_winner_name(game)
        await self.broadcast_to_group(
            self.game_group_id,
            'send_redirect',
            {
                'url': f'/{self.scope["path"].split("/")[1]}/post/{game.game_id}',
                'reason': f'{winner} wins!',
            }
        )

    async def handle_tie(self, game: Any):
        await self.transition_state(game, 'COMPLETED')
        game.p1_status = 'POST'
        game.p2_status = 'POST'
        game.winner = 0
        game.loser = 0
        game.ended = str(await database_sync_to_async(timezone.now)())
        await self.save_game(game)
        
        await self.broadcast_to_group(
            self.game_group_id,
            'send_redirect',
            {
                'url': f'/{self.scope["path"].split("/")[1]}/post/{game.game_id}',
                'reason': 'Tie game!',
            }
        )

    async def broadcast_game_state(self, game: Any, user_id: int):
        p1 = await self.get_player_one(game)
        p2 = await self.get_player_two(game)
        
        await self.broadcast_to_group(
            self.game_group_id,
            'send_message',
            {
                'spaces': game.spaces,
                'round': game.round,
                'plays': game.plays,
                'p1': p1.id if p1 else None,
                'p2': p2.id if p2 else None,
                'current': user_id,
            }
        )

    async def handle_error(self, e: Exception, response: Dict[str, Any]):
        tb_str = ''.join(traceback.format_exception(type(e), e, e.__traceback__))
        message = response.get('message', {})
        
        await self.broadcast_to_group(
            self.game_group_id,
            'error_message',
            f"User: {message.get('user_id')}\nError: {str(e)}\nTraceback:\n{tb_str}"
        )

    async def handle_non_move_message(self, response: Dict[str, Any]):
        if response['type'] == 'heartbeat':
            await self.send(text_data=json.dumps({'type': 'heartbeat'}))

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

class BaseLobbyConsumer(BaseConsumer, LockingMixin, GameStateMixin, PlayerManagementMixin, BroadcastMixin):
    """Base class for lobby-related WebSocket consumers"""
    
    VALID_STATE_TRANSITIONS = {
        'LOBBY': ['IN-GAME'],
        'IN-GAME': ['COMPLETED'],
        'REMATCH': ['IN-GAME'],
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Explicitly initialize the lock here to ensure it exists
        self._lock = asyncio.Lock()

    async def validate_state_transition(self, current_state: str, new_state: str) -> bool:
        return new_state in self.VALID_STATE_TRANSITIONS.get(current_state, [])

    async def transition_state(self, game: Any, new_state: str) -> None:
        if not await self.validate_state_transition(game.status, new_state):
            raise ValueError(f"Invalid state transition from {game.status} to {new_state}")
        game.status = new_state
        await self.save_game(game)

    async def connect(self):
        try:
            self.lobby_id = self.scope['url_route']['kwargs']['game_id']
            self.lobby_group_id = f'lobby_{self.lobby_id}'
            
            await self.channel_layer.group_add(self.lobby_group_id, self.channel_name)
            await self.accept()
            
            await super().connect()

            # Broadcast initial state
            lobby = await self.get_game_instance(self.lobby_id)
            
            if not lobby:
                return
                
            user = await self.get_player_by_username(self.scope["user"], lobby)
            
            if lobby:
                await self.broadcast_lobby_state(lobby, user)
        except Exception as e:
            print(f"Full traceback: {traceback.format_exc()}")

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(self.lobby_group_id, self.channel_name)
            await super().disconnect(close_code)
        except Exception as e:
            print(f"Full traceback: {traceback.format_exc()}")

    async def handle_ready(self, lobby: Any, user_id: Optional[int]) -> None:
        """Handle a player readying up in the lobby"""
        if not user_id:
            raise ValueError('No user ID provided')
            
        async with self._lock:
            if lobby.status not in ['LOBBY', 'REMATCH']:
                raise ValueError('Invalid lobby status for ready action')

            is_p1 = lobby.player_one_object_id == user_id
            is_p2 = lobby.player_two_object_id == user_id
            if not (is_p1 or is_p2):
                raise ValueError('User not in this lobby')

            # Update player status
            if is_p1:
                lobby.p1_status = 'IN-GAME' if lobby.p2_status == 'READY' else 'READY'
                if lobby.p2_status == 'READY':
                    lobby.p2_status = 'IN-GAME'
            else:
                lobby.p2_status = 'IN-GAME' if lobby.p1_status == 'READY' else 'READY'
                if lobby.p1_status == 'READY':
                    lobby.p1_status = 'IN-GAME'

            # Check if game should start
            if lobby.p1_status == 'IN-GAME' and lobby.p2_status == 'IN-GAME':
                await self.transition_state(lobby, 'IN-GAME')
                lobby.round = 1

            await self.save_game(lobby)

    async def handle_leave(self, lobby: Any, user_id: int) -> None:
        async with self._lock:
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
                await self.transition_state(lobby, 'COMPLETED')
            elif lobby.status == 'LOBBY':
                if lobby.player_one_object_id == user_id:
                    lobby.player_one = None
                    lobby.p1_status = 'UNREADY'
                else:
                    lobby.player_two = None
                    lobby.p2_status = 'UNREADY'
            
            await self.save_game(lobby)

    async def handle_error(self, e: Exception, response: Dict[str, Any]):
        tb_str = ''.join(traceback.format_exception(type(e), e, e.__traceback__))
        message = response.get('message', {})
        
        await self.broadcast_to_group(
            self.lobby_group_id,
            'error_message',
            f"User: {message.get('user_id')}\nError: {str(e)}\nTraceback:\n{tb_str}"
        )

    async def receive_json(self, response: Dict[str, Any]):
        """Handle incoming JSON messages for lobby state"""
        await super().receive_json(response)
        try:
            message = response.get('message', {})
            user_id = message.get('user_id')
            lobby = await self.get_game_instance(self.lobby_id)

            if not lobby:
                raise ValueError('Lobby not found')

            if not user_id:
                raise ValueError('No user ID provided in message')

            # Check lobby status before processing actions
            if lobby.status == 'IN-GAME' and response['type'] in ['ready', 'unready']:
                return # Ignore ready/unready if already in game

            if response['type'] == 'ready':
                await self.handle_ready(lobby, user_id)
                if lobby.status == 'IN-GAME':
                    await self.broadcast_to_group(
                        self.lobby_group_id,
                        'send_redirect',
                        {
                            'url': f'/{self.scope["path"].split("/")[1]}/game/{lobby.game_id}',
                            'reason': 'Game is starting...',
                        }
                    )
            elif response['type'] == 'unready':
                await self.handle_unready(lobby, user_id)
            elif response['type'] == 'leave':
                await self.handle_leave(lobby, user_id)
            elif response['type'] == 'continue':
                await self.handle_continue(lobby, user_id)

            await self.broadcast_lobby_state(lobby, self.scope['user'])

        except Exception as e:
            print(f"Full traceback: {traceback.format_exc()}")
            await self.handle_error(e, response)

class BasePostConsumer(BaseConsumer, LockingMixin, GameStateMixin, PlayerManagementMixin, BroadcastMixin):
    """Base class for post-game WebSocket consumers"""

    VALID_STATE_TRANSITIONS = {
        'COMPLETED': ['ARCHIVE'],
        'ARCHIVE': ['REMATCH'],
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Explicitly initialize the lock here to ensure it exists
        self._lock = asyncio.Lock()

    async def validate_state_transition(self, current_state: str, new_state: str) -> bool:
        return new_state in self.VALID_STATE_TRANSITIONS.get(current_state, [])

    async def transition_state(self, game: Any, new_state: str) -> None:
        if not await self.validate_state_transition(game.status, new_state):
            raise ValueError(f"Invalid state transition from {game.status} to {new_state}")
        game.status = new_state
        await self.save_game(game)

    async def connect(self):
        try:
            self.post_id = self.scope['url_route']['kwargs']['game_id']
            self.post_group_id = f'post_{self.post_id}'

            await self.channel_layer.group_add(self.post_group_id, self.channel_name)
            await self.accept()
            await super().connect()

            post = await self.get_game_instance(self.post_id)
            if not post:
                raise ValueError('Post not found')
            else:
                user = await self.get_player_by_username(self.scope["user"], post)
                if post:
                    await self.broadcast_post_state(post, user)
        except Exception as e:
            print(f"Full traceback: {traceback.format_exc()}")

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(self.post_group_id, self.channel_name)
            await super().disconnect(close_code)
        except Exception as e:
            print(f"Full traceback: {traceback.format_exc()}")

    async def receive_json(self, response: Dict[str, Any]):
        """Handle incoming JSON messages for post-game state"""
        await super().receive_json(response)
        try:
            message = response.get('message', {})
            user_id = message.get('user_id')
            game = await self.get_game_instance(self.post_id)

            if not game:
                raise ValueError('Game not found')

            if response['type'] == 'rematch':
                await self.handle_rematch(game, user_id)
            elif response['type'] == 'leave':
                await self.handle_leave(game, user_id)

            await self.broadcast_post_state(game, user_id)

        except Exception as e:
            print(f"Full traceback: {traceback.format_exc()}")
            await self.handle_error(e, response)

    async def handle_rematch(self, game: Any, user_id: int) -> None:
        async with self._lock:
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
        await self.transition_state(game, 'ARCHIVE')

        # Winner becomes player one in rematch
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

        await self.broadcast_to_group(
            self.post_group_id,
            'send_redirect',
            {
                'url': f'/{self.scope["path"].split("/")[1]}/game/{rematch_game.game_id}',
                'reason': 'Rematch beginning...',
            }
        )

    async def handle_leave(self, game: Any, user_id: int) -> None:
        async with self._lock:
            if game.status == 'COMPLETED':
                if game.player_one_object_id == user_id:
                    game.p1_status = 'LEFT'
                    player_left = await self.get_player_one(game)
                else:
                    game.p2_status = 'LEFT'
                    player_left = await self.get_player_two(game)
                await self.transition_state(game, 'ARCHIVE')

            await self.save_game(game)

            await self.broadcast_to_group(
                self.post_group_id,
                'send_redirect',
                {
                    'url': f'/{self.scope["path"].split("/")[1]}',
                    'reason': f'{player_left.username} left the game...',
                }
            )

    async def handle_error(self, e: Exception, response: Dict[str, Any]):
        tb_str = ''.join(traceback.format_exception(type(e), e, e.__traceback__))
        message = response.get('message', {})

        await self.broadcast_to_group(
            self.post_group_id,
            'error_message',
            f"User: {message.get('user_id')}\nError: {str(e)}\nTraceback:\n{tb_str}"
        )
