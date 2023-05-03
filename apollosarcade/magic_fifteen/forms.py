from django import forms

class CreateLobbyForm(forms.Form):
    CHOICES = [
        ('Public','Public'),
        ('Private','Private'),
    ]
    create = forms.ChoiceField(
        widget=forms.RadioSelect,
        choices=CHOICES,
    )
    create_option = forms.CharField(max_length=20,required=False)

class JoinLobbyForm(forms.Form):
    CHOICES = [
        ('Random Lobby', 'Random Lobby'),
        ('Lobby Number', 'Lobby Number'),
    ]
    join = forms.ChoiceField(
        widget=forms.RadioSelect,
        choices=CHOICES,
    )
    join_option = forms.CharField(max_length=10,required=False)