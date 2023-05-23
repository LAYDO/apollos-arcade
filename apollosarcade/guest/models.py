from django.db import models
from django.utils import timezone
import uuid

class Guest(models.Model):
    id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    last_active = models.DateTimeField(default=timezone.now)

    @staticmethod
    def generate_guest_name():
        while True:
            # This will generate a random UUID
            random_string = uuid.uuid4().hex[:6]
            username = 'Guest-' + random_string
            if not Guest.objects.filter(username=username).exists():
                return username
            
    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.generate_guest_name()
        super().save(*args, **kwargs)
