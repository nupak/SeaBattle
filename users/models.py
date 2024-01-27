from django.contrib.auth.models import AbstractUser
from django.db import models


# Create your models here.
class CustomUser(AbstractUser):
    ammo = models.IntegerField(default=0)  # Поле для хранения патронов

    def __str__(self):
        return self.username
