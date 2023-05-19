from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils import timezone
from django_quill.fields import QuillField



# Create your models here.
class Game(models.Model):
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
    playerStatuses = [
        ('UNREADY', 'UNREADY'),
        ('READY', 'READY'),
        ('IN-GAME', 'IN-GAME'),
        ('LEFT', 'LEFT'),
        ('REMATCH', 'REMATCH'),
    ]
    gameStatuses = [
        ('LOBBY', 'LOBBY'),
        ('IN-GAME', 'IN-GAME'),
        ('COMPLETED', 'COMPLETED'),
        ('ARCHIVE', 'ARCHIVE'),
        ('ARCHIVED', 'ARCHIVED'),
    ]
    privacyOptions = [
        ('Public', 'Public'),
        ('Private', 'Private'),
    ]
    game_id = models.BigAutoField(primary_key=True)
    status = models.CharField(max_length=10, choices=gameStatuses, default='LOBBY')
    player_one_content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name='player_one_games', default=None, null=True)
    player_one_object_id = models.PositiveIntegerField(default=None, null=True)
    player_one = GenericForeignKey('player_one_content_type', 'player_one_object_id') # models.ForeignKey(User, on_delete=models.CASCADE, related_name='player_one_games', default=None, null=True)
    player_two_content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name='player_two_games', default=None, null=True)
    player_two_object_id = models.PositiveIntegerField(default=None, null=True)
    player_two = GenericForeignKey('player_two_content_type', 'player_two_object_id') # models.ForeignKey(User, on_delete=models.CASCADE, related_name='player_two_games', default=None, null=True)
    p1_status = models.CharField(max_length=10, choices=playerStatuses, default='UNREADY')
    p2_status = models.CharField(max_length=10, choices=playerStatuses, default='UNREADY')
    round = models.IntegerField(default=1)
    plays = ArrayField(models.IntegerField(blank=True), size=9, default=list)
    spaces = ArrayField(models.IntegerField(blank=True), size=9, default=list)
    winner = models.IntegerField(blank=True, default=0)
    loser = models.IntegerField(blank=True, default=0)
    privacy = models.CharField(max_length=7, choices=privacyOptions, default='Public')
    password = models.CharField(max_length=15, default='')
    created = models.DateTimeField(default=timezone.now)
    ended = models.DateTimeField(null=True, blank=True)

    def get_winning_array(self):
        return self.winningArrays

class GameInstruction(models.Model):
    title = models.CharField(max_length=50, unique=True)
    content = QuillField()

    def __str__(self):
        return self.title