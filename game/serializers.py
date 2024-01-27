import json

from rest_framework import serializers
from game.models import GameField


class GameFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameField
        fields = '__all__'

class ShootSerializer(serializers.ModelSerializer):
    prize_list = serializers.SerializerMethodField()
    class Meta:
        model = GameField
        fields = ['player_shots','bullets', 'sunk_ships', 'prize_list']


    def get_prize_list(self, obj):
        prizes = {}
        for ship in obj.sunk_ships.split():
            data = json.loads(obj.prizes)

            prizes[ship] = data[ship]
        return json.dumps(prizes)