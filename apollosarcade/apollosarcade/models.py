from django.db import models
from django.utils import timezone
import uuid

class Guest(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)
    last_active = models.DateTimeField(default=timezone.now)

    def generate_guest_name(self):
        while True:
            # This will generate a random UUID
            random_string = uuid.uuid4().hex[:6]
            name = 'Guest-' + random_string
            if not Guest.objects.filter(name=name).exists():
                return name
            
    def save(self, *args, **kwargs):
        if not self.name:
            self.name = self.generate_guest_name()
        super().save(*args, **kwargs)
