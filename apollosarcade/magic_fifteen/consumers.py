import json, traceback
from typing import Dict, Any
from base_consumers.base_consumers import BaseGameConsumer, BaseLobbyConsumer, BasePostConsumer

class GameConsumer(BaseGameConsumer):
    """Consumer for handling Magic Fifteen game WebSocket connections"""
    
    async def validate_move(self, game: Any, space: int, play: int, user_id: int) -> None:
        """Validate a move in the Magic Fifteen game"""
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

    async def check_win(self, game: Any) -> bool:
        """Check if the current game state represents a win"""
        for winning_combo in game.winningArrays:
            values = [game.spaces[x] for x in winning_combo if game.spaces[x] != 0]
            if len(values) == 3 and sum(values) == 15:
                return True
        if game.round > 9:
            return False
        return False

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

            async with self._lock:
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
    """Consumer for handling Magic Fifteen game lobby WebSocket connections"""
    pass

class PostConsumer(BasePostConsumer):
    """Consumer for handling Magic Fifteen game post-game WebSocket connections"""
    pass
