import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from django.utils import timezone
from django.apps import apps
class MagicFifteenConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        Game = apps.get_model('magic_fifteen', 'Game')
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
        print(f"Received JSON: {response}")
        try:
            if response['type'] == 'move':
                message = response.get('message', {})
                game_id = message.get('game_id', None)
                space = message.get('space', None)
                play = message.get('play', None)

                game = await self.get_game_instance(game_id)

                if game is None:
                    raise Exception('Game not found')
                                
                print(f"game.round: {game.round}, play: {play}")

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

                win = await self.check_win(game)

                if (win):
                    game.status = 'COMPLETED'
                    if (play % 2 == 0):
                        game.winner = game.player_two
                        game.loser = game.player_one
                    else:
                        game.winner = game.player_one
                        game.loser = game.player_two
                    # game.ended = str(timezone.now())
                    game.ended = str(await sync_to_async(timezone.now)())
                    await self.save_game(game)
                    await self.channel_layer.group_send(
                        self.game_group_id, {
                            'type': 'send_redirect',
                            'message': {
                                'url': f'/fifteentoes/post',
                            }
                        }
                    )


                await self.save_game(game)

                await self.channel_layer.group_send(
                    self.game_group_id, {
                        'type': 'send_message',
                        'message': {
                            'spaces': game.spaces,
                            'round': game.round,
                            'plays': game.plays,
                            'p1': game.player_one,
                            'p2': game.player_two,
                        }
                    })
            elif response['type'] == 'heartbeat':
                await self.send(text_data=json.dumps({
                    'type': 'heartbeat'
                }))
        except Exception as e:
            message = response.get('message', {})
            await self.channel_layer.group_send(
                self.game_group_id, {
                    'type': 'error_message',
                    'message': str(e),
                    'error_user': message.get('user_id', None),
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
                'url': event['message']['url']
            }
        }))

    @database_sync_to_async
    def get_game_instance(self, game_id):
        Game = apps.get_model('fifteen_toes', 'Game')

        # Print the game_id received
        print(f"Looking for game with ID: {game_id}")

        # Retrieve the model instance from the database
        try:
            game = Game.objects.get(game_id=game_id)
            # Print the game instance found
            print(f"Found game: {game}")

            return game
        except Game.DoesNotExist:
            return None
    
    @sync_to_async
    def check_win(self, game):
        win = False
        if game.round <= 9:
            for i in game.winningArrays:
                temp = list()
                for x in i:
                    if game.spaces[x] != 0:
                        temp.append(game.spaces[x])
                if len(set(temp)) == 3 and sum(temp) == 15:
                    win = True
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
