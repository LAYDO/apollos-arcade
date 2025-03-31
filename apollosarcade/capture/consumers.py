import json, traceback
from typing import Dict, Any
from base_consumers.base_consumers import (
    BaseGameConsumer,
    BaseLobbyConsumer,
    BasePostConsumer,
)


class GameConsumer(BaseGameConsumer):
    """Consumer for handling Capture game WebSocket connections"""
    
    async def validate_move(self, game: Any, line: int, play: int, user_id: int) -> None:
        """Validate a move in the Capture game"""
        if game is None:
            raise ValueError("Game not found")
        if line is None or line == -1 or not (0 <= line <= 4):
            raise ValueError("Invalid move")
        if play is None or not (1 <= play <= 100):
            raise ValueError("A line outside within a square is required")
        if (game.round % 2 == 0 and play % 2 != 0) or (
            game.round % 2 != 0 and play % 2 == 0
        ):
            current_player = "Player 1" if game.round % 2 != 0 else "Player 2"
            raise ValueError(f"It is {current_player}'s turn!")
        # TODO: Implement squaresArray validation
        # if game.squaresArray[line] != 0:
        #     raise ValueError("Line is already occupied")

    async def check_win(self, game: Any) -> bool:
        """Check if the current game state represents a win"""
        if game.round > 9:
            return False

        for winning_combo in game.winningArrays:
            values = [game.spaces[x] for x in winning_combo if game.spaces[x] != 0]
            if len(values) == 3 and sum(values) == 15:
                return True
        return False

    async def receive_json(self, response: Dict[str, Any]):
        await super().receive_json(response)
        try:
            if response.get("type") != "move":
                return await self.handle_non_move_message(response)

            message = response.get("message", {})
            line = message.get("line")
            play = message.get("play")
            user_id = message.get("user_id")

            game = await self.get_game_instance(self.game_id)
            await self.validate_move(game, line, play, user_id)

            async with self._lock:
                game.plays.append(play)
                # TODO: Update squaresArray instead of spaces
                # game.squaresArray[line] = play
                game.round += 1

                if await self.check_win(game):
                    await self.handle_win(game, play)
                elif game.round == 101:
                    await self.handle_tie(game)

                await self.save_game(game)
                await self.broadcast_game_state(game, user_id)

        except Exception as e:
            await self.handle_error(e, response)

    async def send_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "payload": {
                        "type": "move",
                        # TODO: Update to use squaresArray
                        # "squares": event["message"]["squares"],
                        "round": event["message"]["round"],
                        "plays": event["message"]["plays"],
                        "p1": event["message"]["p1"],
                        "p2": event["message"]["p2"],
                    },
                }
            )
        )


class LobbyConsumer(BaseLobbyConsumer):
    """Consumer for handling Capture game lobby WebSocket connections"""
    pass


class PostConsumer(BasePostConsumer):
    """Consumer for handling Capture game post-game WebSocket connections"""
    pass
