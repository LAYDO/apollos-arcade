from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
import os
from .email_utils import send_email

class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

    def save(self, commit=True):
        user = super(RegisterForm, self).save(commit=False)
        user.email = self.cleaned_data['email']

        if commit:
            user.save()

            # Send verification email
            sender = os.environ.get('GMAIL_SENDER', None)
            recipient = user.email
            subject = 'Apollo\'s Arcade Email Verification'
            body = f"Please verify your email by clicking this link: https://www.apollosarcade.com/verify/{user.userprofile.verification_code}"
            send_email(sender, recipient, subject, body)

        return user
