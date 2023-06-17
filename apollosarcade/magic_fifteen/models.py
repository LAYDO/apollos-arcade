from django.db import models
from game.models import GameModel
from django.contrib.postgres.fields import ArrayField

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

    def get_winning_array(self):
        return self.winningArrays