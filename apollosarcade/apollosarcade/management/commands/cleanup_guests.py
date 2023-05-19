from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apollosarcade.models import Guest

class Command(BaseCommand):
    help = 'Removes guest accounts that have not been active in the last week'

    def handle(self, *args, **options):
        one_week_ago = timezone.now() - timedelta(days=7)
        Guest.objects.filter(last_active__lt=one_week_ago).delete()
        self.stdout.write(self.style.SUCCESS('Successfully removed old guest accounts'))
