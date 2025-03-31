from django.db import models
from game.models import GameModel
from django.contrib.postgres.fields import ArrayField
from django.contrib.contenttypes.models import ContentType

class Game(GameModel):
    # Board dimensions (default 5x5)
    rows = models.IntegerField(default=5)
    cols = models.IntegerField(default=5)
    
    # Game state
    game_over = models.BooleanField(default=False)
    player1_turn = models.BooleanField(default=True)
    
    # Store the square arrays as a JSON-like structure
    # Each square has 5 values: [top, bottom, left, right, owner]
    # Using ArrayField of ArrayField to match the TypeScript implementation
    square_arrays = ArrayField(
        ArrayField(
            models.IntegerField(),
            size=5,
        ),
        default=list
    )
    player_one_content_type = models.ForeignKey(
        ContentType,
        related_name='capture_player_one_games',
        on_delete=models.CASCADE,
        default=None,
        null=True,
    )
    player_two_content_type = models.ForeignKey(
        ContentType,
        related_name='capture_player_two_games',
        on_delete=models.CASCADE,
        default=None,
        null=True,
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.square_arrays:
            # Initialize empty board - matches TypeScript implementation
            self.square_arrays = [[0] * 5 for _ in range(self.rows * self.cols)]

    def get_scores(self):
        """Calculate the current scores for both players"""
        player1_score = sum(1 for square in self.square_arrays if square[4] == 1)
        player2_score = sum(1 for square in self.square_arrays if square[4] == 2)
        return player1_score, player2_score

    def is_square_complete(self, square_index):
        """Check if a square is completed"""
        square = self.square_arrays[square_index]
        return all(side != 0 for side in square[:4])

    class Meta:
        db_table = 'capture_game'

