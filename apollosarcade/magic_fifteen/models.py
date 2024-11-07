from django.db import models
from game.models import GameModel
from django.contrib.postgres.fields import ArrayField
from django.contrib.contenttypes.models import ContentType

# Create your models here.
class Game(GameModel):
    winningArrays = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ]
    plays = ArrayField(models.IntegerField(blank=True), size=9, default=list)
    spaces = ArrayField(models.IntegerField(blank=True), size=9, default=list)
    player_one_content_type = models.ForeignKey(
        ContentType,
        related_name="magic_fifteen_player_one_games",
        on_delete=models.CASCADE,
        default=None,
        null=True,
    )
    player_two_content_type = models.ForeignKey(
        ContentType,
        related_name="magic_fifteen_player_two_games",
        on_delete=models.CASCADE,
        default=None,
        null=True,
    )

    def get_winning_array(self):
        return self.winningArrays
