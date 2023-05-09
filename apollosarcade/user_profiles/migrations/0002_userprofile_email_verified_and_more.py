from django.db import migrations, models
import uuid

def create_unique_verification_codes(apps, schema_editor):
    UserProfile = apps.get_model('user_profiles', 'UserProfile')
    verification_codes = set()
    for profile in UserProfile.objects.all():
        while True:
            new_code = uuid.uuid4()
            if new_code not in verification_codes:
                break
        verification_codes.add(new_code)
        profile.verification_code = new_code
        profile.save()

def noop(*args, **kwargs):
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('user_profiles', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='email_verified',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='verification_code',
            field=models.UUIDField(null=True),
        ),
        migrations.RunPython(create_unique_verification_codes, noop),
        migrations.AlterField(
            model_name='userprofile',
            name='verification_code',
            field=models.UUIDField(null=True, unique=True),
        ),
    ]
