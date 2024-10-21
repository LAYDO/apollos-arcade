import json, traceback
from django.contrib.auth.models import User, AnonymousUser
from django.contrib.contenttypes.models import ContentType
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from django.utils import timezone
from django.apps import apps
from guest.models import Guest
from base_consumers.base_consumers import BaseGameConsumer, BaseLobbyConsumer, BasePostConsumer

class GameConsumer(BaseGameConsumer):

    async def receive_json(self, response):
        await super().receive_json(response)
        try:
            if response['type'] == 'move':
                message = response.get('message', {})
                game_id = message.get('game_id', None)
                user_id = message.get('user_id', None)
                space = message.get('space', None)
                play = message.get('play', None)

                game = await self.get_game_instance(self.game_id)

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
                            'p1': p1.id if p1 else None,
                            'p2': p2.id if p2 else None,
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

class LobbyConsumer(BaseLobbyConsumer):
    async def connect(self):
        await super().connect()
        lobby = await self.get_game_instance(self.lobby_id)
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
                        'p1': p1.username if p1 else None,
                        'p2': p2.username if p2 else None,
                        'p1ID': lobby.player_one_object_id,
                        'p2ID': lobby.player_two_object_id,
                        'p1Status': lobby.p1_status,
                        'p2Status': lobby.p2_status,
                        'privacy': lobby.privacy,
                        'current': user.id,
                        'round': lobby.round,
                    }
                })

    async def receive_json(self, response):
        await super().receive_json(response)
        try:
            message = response.get('message', {})
            lobby_id = message.get('game_id', None)
            user_id = message.get('user_id', None)
            lobby = await self.get_game_instance(self.lobby_id)
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
class PostConsumer(BasePostConsumer):

    async def receive_json(self, response):
        await super().receive_json(response)
        try:
            if response['type'] == 'rematch':
                message = response.get('message', {})
                post_id = message.get('game_id', None)
                user_id = message.get('user_id', None)

                game = await self.get_game_instance(self.post_id)

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

                game = await self.get_game_instance(post_id)

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
