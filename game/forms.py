from django import forms

from game.models import GameField
from users.models import CustomUser


class GameFieldForm(forms.ModelForm):
    class Meta:
        model = GameField
        fields = ['player']
        labels = {
            'player': 'Игрок',
        }
        widgets = {
            'player': forms.Select(attrs={'id': 'player'}),
        }

class BulletForm(forms.ModelForm):
    class Meta:
        model = GameField
        fields = ['bullets']
