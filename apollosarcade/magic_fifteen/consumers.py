import json, traceback
from typing import Dict, Any
from base_consumers.base_consumers import BaseGameConsumer, BaseLobbyConsumer, BasePostConsumer

class GameConsumer(BaseGameConsumer):
    async def validate_move(self, game, space: int, play: int, user_id: int) -> None:
        if game is None:
            raise ValueError('Game not found')
        if space is None or space == -1 or not (0 <= space <= 8):
            raise ValueError('Invalid space')
        if play is None or not (1 <= play <= 9):
            raise ValueError('A valid selection (1-9) is required')
        if (game.round % 2 == 0 and play % 2 != 0) or (game.round % 2 != 0 and play % 2 == 0):
            current_player = "Player 1" if game.round % 2 != 0 else "Player 2"
            raise ValueError(f"It is {current_player}'s turn!")
        if game.spaces[space] != 0:
            raise ValueError('Square is already occupied')

    async def receive_json(self, response: Dict[str, Any]):
        await super().receive_json(response)
        try:
            if response.get('type') != 'move':
                return await self.handle_non_move_message(response)

            message = response.get('message', {})
            space = message.get('space')
            play = message.get('play')
            user_id = message.get('user_id')

            game = await self.get_game_instance(self.game_id)
            await self.validate_move(game, space, play, user_id)

            async with self.game_lock:
                game.plays.append(play)
                game.spaces[space] = play
                game.round += 1

                if await self.check_win(game):
                    await self.handle_win(game, play)
                elif game.round == 10:
                    await self.handle_tie(game)
                
                await self.save_game(game)
                await self.broadcast_game_state(game, user_id)

        except Exception as e:
            await self.handle_error(e, response)

    async def check_win(self, game) -> bool:
        if game.round > 9:
            return False
            
        for winning_combo in game.winningArrays:
            values = [game.spaces[x] for x in winning_combo if game.spaces[x] != 0]
            if len(values) == 3 and sum(values) == 15:
                return True
        return False

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

    async def receive_json(self, response: Dict[str, Any]):
        await super().receive_json(response)
        try:
            message = response.get('message', {})
            user_id = message.get('user_id')
            lobby = await self.get_game_instance(self.lobby_id)

            if not lobby:
                raise ValueError('Lobby not found')

            if response['type'] == 'ready':
                await self.handle_ready(lobby, user_id)
                if lobby.status == 'IN-GAME':
                    await self.channel_layer.group_send(
                        self.lobby_group_id, {
                            'type': 'send_redirect',
                            'message': {
                                'url': f'/magic_fifteen/game/{lobby.game_id}',
                                'reason': 'Game is starting...'
                            }
                        }
                    )
            elif response['type'] == 'unready':
                await self.handle_unready(lobby, user_id)
            elif response['type'] == 'leave':
                await self.handle_leave(lobby, user_id)
            elif response['type'] == 'continue':
                await self.handle_continue(lobby, user_id)

            await self.broadcast_lobby_state(lobby, user_id)

        except Exception as e:
            await self.handle_error(e, response)

class PostConsumer(BasePostConsumer):
    async def receive_json(self, response: Dict[str, Any]):
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
                
        except Exception as e:
            await self.handle_error(e, response)
