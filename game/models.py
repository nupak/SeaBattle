from django.db import models
from django.urls import reverse

from users.models import CustomUser


class GameField(models.Model):
    player = models.ForeignKey(CustomUser, related_name='player', on_delete=models.CASCADE)
    field_size = models.IntegerField(default=5)  # Размер поля игры
    ships = models.CharField(max_length=512)
    sunk_ships = models.CharField(max_length=512, default="")
    player_shots = models.CharField(max_length=512, default="")  # Список полей, по которым уже были сделаны выстрелы
    bullets = models.IntegerField(default=2)
    prizes = models.TextField(default="")
    isOver = models.BooleanField(default=False)
    def __str__(self):
        return f'Поле игры игрока {self.player}'

    def get_absolute_url(self):
        return reverse('game_detail', kwargs={'pk': self.pk})

