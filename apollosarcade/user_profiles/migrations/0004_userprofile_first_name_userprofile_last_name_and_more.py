# Generated by Django 4.2.1 on 2023-06-20 01:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("user_profiles", "0003_userprofile_verification_code_expires_at_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="first_name",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="userprofile",
            name="last_name",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="userprofile",
            name="location",
            field=models.CharField(blank=True, max_length=100),
        ),
    ]
