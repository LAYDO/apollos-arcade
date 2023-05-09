from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid, datetime

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # Add any custom fields for your user profile, e.g.:
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    email_verified = models.BooleanField(default=False)
    verification_code = models.UUIDField(default=uuid.uuid4, unique=True)
    verification_code_expires_at = models.DateTimeField(null=True)

    VERIFICATION_CODE_EXPIRATION_DURATION = datetime.timedelta(minutes=30)

    def generate_verification_code(self):
        self.verification_code = uuid.uuid4()
        self.verification_code_expires_at = datetime.datetime.now() + self.VERIFICATION_CODE_EXPIRATION_DURATION

    def __str__(self):
        return self.user.username

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.userprofile.save()
