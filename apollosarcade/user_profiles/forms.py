from django import forms
from .models import UserProfile

class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['banner', 'avatar', 'first_name', 'last_name', 'bio', 'location']
