import json, traceback
from django.contrib.auth.models import User, AnonymousUser
from django.contrib.contenttypes.models import ContentType
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from django.utils import timezone
from django.apps import apps
from guest.models import Guest

class GameConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game_group_id = 'game_%s' % self.game_id

        await self.channel_layer.group_add(
            self.game_group_id,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        print('Disconnected')
        await self.channel_layer.group_discard(
            self.game_group_id,
            self.channel_name
        )

    async def receive_json(self, response):
        if (isinstance(response, str)):
            try:
                response = json.loads(response)
            except json.JSONDecodeError:
                traceback.print_exc()
                return
        try:
            if response['type'] == 'move':
                message = response.get('message', {})
                game_id = message.get('game_id', None)
                user_id = message.get('user_id', None)
                space = message.get('space', None)
                play = message.get('play', None)

                game = await self.get_game_instance()

                if game is None:
                    raise Exception('Game not found')
                if space is None or space == -1:
                    raise Exception('Invalid space')
                if play is None:
                    raise Exception('A selection is required before clicking a square')
                if (game.round % 2 == 0 and play % 2 != 0) or (game.round % 2 != 0 and play % 2 == 0):
                    current_player = "Player 1" if game.round % 2 != 0 else "Player 2"
                    raise Exception(f"It is {current_player}'s turn!")
                if game.spaces[space] != 0:
                    raise Exception('Square is already occupied')
                

                newPlays = game.plays
                newPlays.append(play)
                newSpaces = game.spaces
                newSpaces[space] = play
                newRound = game.round + 1

                game.plays = newPlays
                game.spaces = newSpaces
                game.round = newRound

                win = self.check_win(game)

                if (win):
                    game.status = 'COMPLETED'
                    game.p1_status = 'POST'
                    game.p2_status = 'POST'
                    if (play % 2 == 0):
                        game.winner = game.player_two_object_id
                        game.loser = game.player_one_object_id
                    else:
                        game.winner = game.player_one_object_id
                        game.loser = game.player_two_object_id
                    # game.ended = str(timezone.now())
                    game.ended = str(await sync_to_async(timezone.now)())
                    await self.save_game(game)
                    winner = await self.get_winner_name(game)
                    await self.channel_layer.group_send(
                        self.game_group_id, {
                            'type': 'send_redirect',
                            'message': {
                                'url': f'/magic_fifteen/post/{game_id}',
                                'reason': f'{winner} wins!',
                            }
                        }
                    )
                elif (game.round == 10 and not win):
                    game.status = 'COMPLETED'
                    game.p1_status = 'POST'
                    game.p2_status = 'POST'
                    game.winner = 0
                    game.loser = 0
                    game.ended = str(await sync_to_async(timezone.now)())
                    await self.save_game(game)
                    await self.channel_layer.group_send(
                        self.game_group_id, {
                            'type': 'send_redirect',
                            'message': {
                                'url': f'/magic_fifteen/post/{game_id}',
                                'reason': 'Tie game!',
                            }
                        }
                    )
                
                await self.save_game(game)
                p1 = await self.get_player_one(game)
                p2 = await self.get_player_two(game)

                await self.channel_layer.group_send(
                    self.game_group_id, {
                        'type': 'send_message',
                        'message': {
                            'spaces': game.spaces,
                            'round': game.round,
                            'plays': game.plays,
                            'p1': p1.id,
                            'p2': p2.id,
                            'current': user_id,
                        }
                    })
            elif response['type'] == 'heartbeat':
                await self.send(text_data=json.dumps({
                    'type': 'heartbeat'
                }))
        except Exception as e:
            tb_str = traceback.format_exception(type(e), e, e.__traceback__)
            tb_str = ''.join(tb_str)

            message = response.get('message', {})
            await self.channel_layer.group_send(
                self.game_group_id, {
                    'type': 'error_message',
                    'message': f"User: {user_id}\nError: {str(e)}\nTraceback:\n{tb_str}",
                })

    async def send_message(self, event):
        await self.send(text_data=json.dumps({
            "payload": {
                "type": "move",
                "spaces": event['message']['spaces'],
                "round": event['message']['round'],
                "plays": event['message']['plays'],
                "p1": event['message']['p1'],
                "p2": event['message']['p2'],
            },
        }))

    async def send_redirect(self, event):
        await self.send(text_data=json.dumps({
            'payload': {
                'type': 'redirect',
                'url': event['message']['url'],
                'reason': event['message']['reason'],
            }
        }))

    @database_sync_to_async
    def get_game_instance(self):
        app = self.scope['path'].split('/')[1]
        Game = apps.get_model(app, 'Game')

        # Retrieve the model instance from the database
        try:
            game = Game.objects.get(game_id=self.game_id)
            return game
        except Game.DoesNotExist:
            return None
    
    def check_win(self, game):
        win = False
        if game.round <= 9:
            winning_arrays = game.winningArrays
            for i in winning_arrays:
                temp = list()
                for x in i:
                    if game.spaces[x] != 0:
                        temp.append(game.spaces[x])
                if len(set(temp)) == 3 and sum(temp) == 15:
                    win = True
        print(f"Win: {win}")
        return win
    
    async def error_message(self, event):
        await self.send(text_data=json.dumps({
            'payload': {
                'type': 'error',
                'error': event['message']
            }
        }))

    @database_sync_to_async
    def save_game(self, game):
        game.save()
        print(f"Game saved: {game}")

    @database_sync_to_async
    def get_player_one(self, game):
        return game.player_one
    
    @database_sync_to_async
    def get_player_two(self, game):
        return game.player_two
    
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

class LobbyConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.lobby_id = self.scope['url_route']['kwargs']['game_id']
        self.lobby_group_id = 'lobby_%s' % self.lobby_id

        await self.channel_layer.group_add(
            self.lobby_group_id,
            self.channel_name
        )
        await self.accept()
        lobby = await self.get_game_instance()
        user = await self.get_player_by_username(self.scope["user"], lobby)
        if lobby:
            p1 = await self.get_player_one(lobby)
            p2 = await self.get_player_two(lobby)
            await self.channel_layer.group_send(
                self.lobby_group_id, {
                    'type': 'send_message',
                    'message': {
                        'id': lobby.game_id,
                        'status': lobby.status,
                        'p1': p1,
                        'p2': p2,
                        'p1ID': lobby.player_one_object_id,
                        'p2ID': lobby.player_two_object_id,
                        'p1Status': lobby.p1_status,
                        'p2Status': lobby.p2_status,
                        'privacy': lobby.privacy,
                        'current': user.id,
                        'round': lobby.round,
                    }
                })

    async def disconnect(self, close_code):
        print('Disconnected')
        await self.channel_layer.group_discard(
            self.lobby_group_id,
            self.channel_name
        )

    async def receive_json(self, response):
        if (isinstance(response, str)):
            try:
                response = json.loads(response)
            except json.JSONDecodeError:
                traceback.print_exc()
                return
        try:
            message = response.get('message', {})
            lobby_id = message.get('game_id', None)
            user_id = message.get('user_id', None)
            lobby = await self.get_game_instance()
            if lobby:
                p1 = await self.get_player_one(lobby)
                p2 = await self.get_player_two(lobby)
                if response['type'] == 'ready':
                    if (lobby.status == 'LOBBY' or lobby.status == 'REMATCH'):
                        if (lobby.player_one_object_id == user_id):
                            if (lobby.p2_status == 'READY'):
                                lobby.p1_status = 'IN-GAME'
                                lobby.p2_status = 'IN-GAME'
                            else:
                                lobby.p1_status = 'READY'
                        elif (lobby.player_two_object_id == user_id):
                            if (lobby.p1_status == 'READY'):
                                lobby.p2_status = 'IN-GAME'
                                lobby.p1_status = 'IN-GAME'
                            else:
                                lobby.p2_status = 'READY'
                        await self.save_game(lobby)
                        if (lobby.p1_status == 'IN-GAME' and lobby.p2_status == 'IN-GAME'):
                            lobby.status = 'IN-GAME'
                            lobby.round = 1
                            await self.save_game(lobby)
                            await self.channel_layer.group_send(
                                self.lobby_group_id, {
                                    'type': 'send_redirect',
                                    'message': {
                                        'url': f'/magic_fifteen/game/{lobby.game_id}',
                                        'reason': 'Game is starting...'
                                    }
                                }
                            )
                    # else:
                    await self.channel_layer.group_send(
                        self.lobby_group_id, {
                            'type': 'send_message',
                            'message': {
                                'id': lobby.game_id,
                                'status': lobby.status,
                                'p1': p1,
                                'p2': p2,
                                'p1ID': lobby.player_one_object_id,
                                'p2ID': lobby.player_two_object_id,
                                'p1Status': lobby.p1_status,
                                'p2Status': lobby.p2_status,
                                'privacy': lobby.privacy,
                                'current': user_id,
                                'round': lobby.round,
                            }
                        })
                elif response['type'] == 'unready':
                    if (lobby.player_one_object_id == user_id):
                        lobby.p1_status = 'UNREADY'
                    elif (lobby.player_two_object_id == user_id):
                        lobby.p2_status = 'UNREADY'
                    await self.save_game(lobby)
                    await self.channel_layer.group_send(
                        self.lobby_group_id, {
                            'type': 'send_message',
                            'message': {
                                'id': lobby.game_id,
                                'status': lobby.status,
                                'p1': p1,
                                'p2': p2,
                                'p1ID': lobby.player_one_object_id,
                                'p2ID': lobby.player_two_object_id,
                                'p1Status': lobby.p1_status,
                                'p2Status': lobby.p2_status,
                                'privacy': lobby.privacy,
                                'current': user_id,
                                'round': lobby.round,
                            }
                        })
                elif response['type'] == 'leave':
                    if (lobby.status == 'IN-GAME'):
                        # Logic for abandoning game
                        if (lobby.player_one_object_id == user_id):
                            lobby.winner = lobby.player_two_object_id
                            lobby.loser = lobby.player_one_object_id
                            lobby.p1_status = 'ABANDONED'
                            lobby.p2_status = 'POST'
                        elif (lobby.player_two_object_id == user_id):
                            lobby.winner = lobby.player_one_object_id
                            lobby.loser = lobby.player_two_object_id
                            lobby.p2_status = 'ABANDONED'
                            lobby.p1_status = 'POST'
                        lobby.status = 'COMPLETED'
                        await self.save_game(lobby)
                        await self.channel_layer.group_send(
                            self.lobby_group_id, {
                                'type': 'send_redirect',
                                'message': {
                                    'url': f'/magic_fifteen/post/{lobby.game_id}',
                                }
                            }
                        )
                    elif (lobby.status == 'LOBBY'):
                        if (lobby.player_one_object_id == user_id):
                            lobby.player_one = None
                            lobby.p1_status = 'UNREADY'
                        elif (lobby.player_two_object_id == user_id):
                            lobby.player_two = None
                            lobby.p2_status = 'UNREADY'
                        await self.save_game(lobby)
                        await self.channel_layer.group_send(
                            self.lobby_group_id, {
                                'type': 'send_leave',
                                'message': {
                                    'current': user_id,
                                    'url': f'/magic_fifteen/',
                                    'reason': 'You have left the lobby.'
                                }
                            }
                        )
                    await self.channel_layer.group_send(
                        self.lobby_group_id, {
                            'type': 'send_message',
                            'message': {
                                'id': lobby.game_id,
                                'status': lobby.status,
                                'p1': p1,
                                'p2': p2,
                                'p1ID': lobby.player_one_object_id,
                                'p2ID': lobby.player_two_object_id,
                                'p1Status': lobby.p1_status,
                                'p2Status': lobby.p2_status,
                                'privacy': lobby.privacy,
                                'current': user_id,
                                'round': lobby.round,
                            }
                        })
                elif response['type'] == 'continue':
                    await self.channel_layer.group_send(
                            self.lobby_group_id, {
                                'type': 'send_continue',
                                'message': {
                                    'current': user_id,
                                    'url': f'/magic_fifteen/game/{lobby.game_id}',
                                    'reason': 'Continuing to game.',
                                }
                            }
                        )
        except Exception as e:
            tb_str = traceback.format_exception(type(e), e, e.__traceback__)
            tb_str = ''.join(tb_str)

            message = response.get('message', {})
            await self.channel_layer.group_send(
                self.lobby_group_id, {
                    'type': 'error_message',
                    'message': f"User: {user_id}\nError: {str(e)}\nTraceback:\n{tb_str}",
                })

    async def send_message(self, event):
        await self.send(text_data=json.dumps({
            "payload": {
                'type': 'update',
                "id": event['message']['id'],
                "status": event['message']['status'],
                "p1": event['message']['p1'],
                "p2": event['message']['p2'],
                "p1ID": event['message']['p1ID'],
                "p2ID": event['message']['p2ID'],
                "p1Status": event['message']['p1Status'],
                "p2Status": event['message']['p2Status'],
                "privacy": event['message']['privacy'],
                "current": event['message']['current'],
                "round": event['message']['round'],
            },
        }))

    async def send_redirect(self, event):
        await self.send(text_data=json.dumps({
            'payload': {
                'type': 'redirect',
                'url': event['message']['url'],
                'reason': event['message']['reason'],
            }
        }))

    async def send_leave(self, event):
        await self.send(text_data=json.dumps({
            'payload': {
                'type': 'leave',
                'url': event['message']['url'],
                'reason': event['message']['reason'],
                'current': event['message']['current'],
            }
        }))

    async def send_continue(self, event):
        await self.send(text_data=json.dumps({
            'payload': {
                'type': 'continue',
                'url': event['message']['url'],
                'reason': event['message']['reason'],
                'current': event['message']['current'],
            }
        }))

    @database_sync_to_async
    def get_game_instance(self):
        app = self.scope['path'].split('/')[1]
        Game = apps.get_model(app, 'Game')
        # Retrieve the model instance from the database
        try:
            game = Game.objects.get(game_id=self.lobby_id)
            return game
        except Game.DoesNotExist:
            return None
    
    async def error_message(self, event):
        await self.send(text_data=json.dumps({
            'payload': {
                'type': 'error',
                'error': event['message']
            }
        }))

    @database_sync_to_async
    def save_game(self, lobby):
        lobby.save()

    @database_sync_to_async
    def get_player_one(self, lobby):
        player1 = None
        if (lobby.player_one != None):
                if (str(ContentType.objects.get_for_model(lobby.player_one)).lower() == 'auth | user'):
                    player1 = User.objects.get(id=lobby.player_one_object_id).username
                else:
                    player1 = Guest.objects.get(id=lobby.player_one_object_id).username
        return player1
    
    @database_sync_to_async
    def get_player_two(self, lobby):
        player2 = None
        if (lobby.player_two != None):
                if (str(ContentType.objects.get_for_model(lobby.player_two)).lower() == 'auth | user'):
                    player2 = User.objects.get(id=lobby.player_two_object_id).username
                else:
                    player2 = Guest.objects.get(id=lobby.player_two_object_id).username
        return player2
    
    @database_sync_to_async
    def get_player_by_username(self, user, lobby):
        try:
            if user.is_authenticated:
                # This is an authenticated user.
                return User.objects.get(username=user.username)
            elif isinstance(user, AnonymousUser):
                # This is a guest.
                if (ContentType.objects.get_for_model(lobby.player_one) == ContentType.objects.get_for_model(Guest)):
                    return Guest.objects.get(id=lobby.player_one_object_id)
                elif (ContentType.objects.get_for_model(lobby.player_two) == ContentType.objects.get_for_model(Guest)):
                    return Guest.objects.get(id=lobby.player_two_object_id)
            else:
                # This is an unexpected situation, handle accordingly.
                pass
        except User.DoesNotExist:
            raise Exception('Player not found')
        except Guest.DoesNotExist:
                raise Exception('Player not found')
        
class PostConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.post_id = self.scope['url_route']['kwargs']['game_id']
        self.post_group_id = 'post_%s' % self.post_id

        await self.channel_layer.group_add(
            self.post_group_id,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        print('Disconnected')
        await self.channel_layer.group_discard(
            self.post_group_id,
            self.channel_name
        )

    async def receive_json(self, response):
        if (isinstance(response, str)):
            try:
                response = json.loads(response)
            except json.JSONDecodeError:
                traceback.print_exc()
                return
        try:
            if response['type'] == 'rematch':
                message = response.get('message', {})
                post_id = message.get('game_id', None)
                user_id = message.get('user_id', None)

                game = await self.get_game_instance()

                if (game.player_one_object_id == user_id):
                    game.p1_status = 'REMATCH'

                elif (game.player_two_object_id == user_id):
                    game.p2_status = 'REMATCH'
                
                await self.save_game(game)

                if (game.player_one_object_id == game.winner):
                    player_one = await self.get_player_one(game)
                    player_two = await self.get_player_two(game)
                else:
                    player_one = await self.get_player_two(game)
                    player_two = await self.get_player_one(game)

                if (game.p1_status == 'REMATCH' and game.p2_status == 'REMATCH'):
                    game.status = 'ARCHIVE'
                    await self.save_game(game)
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
                        spaces=[0,0,0,0,0,0,0,0,0],
                    )
                    await self.save_game(rematch_game)
                    await self.channel_layer.group_send(
                        self.post_group_id, {
                            'type': 'send_redirect',
                            'message': {
                                'url': f'/magic_fifteen/game/{rematch_game.game_id}',
                                'reason': 'Rematch beginning...',
                            }
                        })

                await self.channel_layer.group_send(
                    self.post_group_id, {
                        'type': 'send_message',
                        'message': {
                            'p1Status': game.p1_status if game.player_one_object_id == game.winner else game.p2_status,
                            'p2Status': game.p2_status if game.player_two_object_id == game.loser else game.p1_status,
                        }
                    })
            elif response['type'] == 'leave':
                message = response.get('message', {})
                post_id = message.get('game_id', None)
                user_id = message.get('user_id', None)

                game = await self.get_game_instance()

                if (game.player_one_object_id == user_id):
                    game.p1_status = 'LEFT'
                    player_left = await self.get_player_one(game)
                elif (game.player_two_object_id == user_id):
                    game.p2_status = 'LEFT'
                    player_left = await self.get_player_two(game)
                game.status = 'ARCHIVE'
                await self.save_game(game)
                await self.channel_layer.group_send(
                    self.post_group_id, {
                        'type': 'send_redirect',
                        'message': {
                            'url': '/magic_fifteen',
                            'reason': f'{player_left.username} left the game...',
                        }
                    })
        except Exception as e:
            tb_str = traceback.format_exception(type(e), e, e.__traceback__)
            tb_str = ''.join(tb_str)

            message = response.get('message', {})
            await self.channel_layer.group_send(
                self.post_group_id, {
                    'type': 'error_message',
                    'message': f"User: {user_id}\nError: {str(e)}\nTraceback:\n{tb_str}",
                })

    async def send_message(self, event):
        await self.send(text_data=json.dumps({
            "payload": {
                "type": "update",
                "p1Status": event['message']['p1Status'],
                "p2Status": event['message']['p2Status'],
            },
        }))

    async def send_redirect(self, event):
        await self.send(text_data=json.dumps({
            'payload': {
                'type': 'redirect',
                'url': event['message']['url'],
                'reason': event['message']['reason'],
            }
        }))

    @database_sync_to_async
    def get_game_instance(self):
        app = self.scope['path'].split('/')[1]
        Game = apps.get_model(app, 'Game')

        # Retrieve the model instance from the database
        try:
            game = Game.objects.get(game_id=self.post_id)
            return game
        except Game.DoesNotExist:
            return None
    
    async def error_message(self, event):
        await self.send(text_data=json.dumps({
            'payload': {
                'type': 'error',
                'error': event['message']
            }
        }))

    @database_sync_to_async
    def save_game(self, game):
        game.save()

    @database_sync_to_async
    def get_player_one(self, lobby):
        player1 = None
        if (lobby.player_one != None):
                if (str(ContentType.objects.get_for_model(lobby.player_one)).lower() == 'auth | user'):
                    player1 = User.objects.get(id=lobby.player_one_object_id)
                else:
                    player1 = Guest.objects.get(id=lobby.player_one_object_id)
        return player1
    
    @database_sync_to_async
    def get_player_two(self, lobby):
        player2 = None
        if (lobby.player_two != None):
                if (str(ContentType.objects.get_for_model(lobby.player_two)).lower() == 'auth | user'):
                    player2 = User.objects.get(id=lobby.player_two_object_id)
                else:
                    player2 = Guest.objects.get(id=lobby.player_two_object_id)
        return player2
