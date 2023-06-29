from json import JSONEncoder
from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid, datetime

from magic_fifteen.models import Game as MagicFifteenGame

def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return 'user_{0}/{1}'.format(instance.user.id, filename)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    banner = models.ImageField(upload_to=user_directory_path, null=True, blank=True)
    avatar = models.ImageField(upload_to=user_directory_path, null=True, blank=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=100, blank=True)
    email_verified = models.BooleanField(default=False)
    verification_code = models.UUIDField(default=uuid.uuid4, unique=True)
    verification_code_expires_at = models.DateTimeField(null=True)

    VERIFICATION_CODE_EXPIRATION_DURATION = datetime.timedelta(minutes=30)

    def generate_verification_code(self):
        self.verification_code = uuid.uuid4()
        self.verification_code_expires_at = datetime.datetime.now() + self.VERIFICATION_CODE_EXPIRATION_DURATION

    def __str__(self):
        return self.user.username
    
    def magic_15_stats(self):
        user_content_type_id = ContentType.objects.get_for_model(self.user)

        games_as_player_one = MagicFifteenGame.objects.filter(player_one_content_type_id=user_content_type_id, player_one_object_id=self.user.id)
        games_as_player_two = MagicFifteenGame.objects.filter(player_two_content_type_id=user_content_type_id, player_two_object_id=self.user.id)

        total_games = games_as_player_one.count() + games_as_player_two.count()
        total_wins = games_as_player_one.filter(winner=self.user.id).count() + games_as_player_two.filter(winner=self.user.id).count()

        games = { 'total_games': total_games, 'total_wins': total_wins }
        return JSONEncoder().encode(games)
    

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.userprofile.save()
