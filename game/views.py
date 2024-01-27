import json

from django.http import HttpResponseRedirect
from django.urls import reverse
from django.views.generic import ListView

from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required

from .forms import GameFieldForm
from .serializers import GameFieldSerializer, ShootSerializer
from game.models import GameField

def CreateGameFieldView(request):
    """Выводит шаблон создания и далее отправляет запрос по API
       Разделены потому что JS будет добавлять данные из интерфейса создания"""
    form = GameFieldForm()
    return render(request, 'game/create_table.html', {'form': form})


@method_decorator(login_required, name='dispatch')
class GamesListView(ListView):
    """Список игр"""
    model = GameField
    template_name = 'game/games_list.html'
    context_object_name = 'games_list'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = GameField.objects.filter(player=self.request.user)
        return queryset


@method_decorator(login_required, name='dispatch')
class GameFieldView(APIView):
    """Страница конкретной игры"""
    template_name = 'game/game_detail.html'

    def get(self, request, pk):
        """TODO делать разный вывод в зависимости от статуса пользователя
        Есть щаблон для админа а есть для пользователя
        и у каждого пользователя свое поле
        """
        game = get_object_or_404(GameField, pk=pk)
        prizes_list = json.dumps(ShootSerializer().get_prize_list(game))
        if request.user.is_staff:
            return render(request, self.template_name, {"game":game, "prizes_list":prizes_list})
        elif game.player != request.user:
            # Если нет доступа, делаем редирект на home
            return HttpResponseRedirect(reverse('home'))
        return render(request, self.template_name, {'game': game, "prizes_list":prizes_list})


@method_decorator(login_required, name='dispatch')
class GameFieldAPIView(APIView):
    """API для создания и обновления поля"""

    def post(self, request):
        serializer = GameFieldSerializer(data=request.data)

        # Проверяем, существует ли игра с этим пользователем
        player = request.data.get('player')
        if GameField.objects.filter(player=player).exists():
            return Response({"error": "Игра с этим пользователем уже существует."}, status=status.HTTP_400_BAD_REQUEST)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        game = get_object_or_404(GameField, pk=pk)
        serializer = GameFieldSerializer(game, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(login_required, name='dispatch')
class ShootAPIView(APIView):
    def get(self, request, pk):
        game = get_object_or_404(GameField, pk=pk)
        if request.user != game.player:
            return Response({"error": "Вы не являетесь участником этой игры."}, status=status.HTTP_403_FORBIDDEN)

        shot_coordinates = request.query_params.get('coordinates')
        if not shot_coordinates:
            return Response({"error": "Координаты выстрела не предоставлены."}, status=status.HTTP_400_BAD_REQUEST)
        elif game.bullets < 1:
            return Response({"error": "У вас нет пуль."}, status=status.HTTP_400_BAD_REQUEST)
        else:

            if shot_coordinates not in game.player_shots:
                game.player_shots += f"{shot_coordinates} "
                if shot_coordinates in game.ships:
                    game.sunk_ships += f"{shot_coordinates} "

                else:
                    game.bullets -= 1

            # Проверяем, завершена ли игра
            if len(game.ships) == len(game.sunk_ships):
                game.is_over = True
            game.save()
            serializer = ShootSerializer(game)
            return Response(serializer.data, status=status.HTTP_200_OK)


@method_decorator(login_required, name='dispatch')
class BulletControlAPIView(APIView):
    def post(self, request, pk):
        game = get_object_or_404(GameField, pk=pk)
        if not request.user.is_staff:
            return Response({"error": "Недостаточно прав доступа."}, status=status.HTTP_403_FORBIDDEN)

        action = request.data.get("action")
        if action == "add":
            bullets = 1
        elif action == "remove":
            bullets = -1
        else:
            return Response({"error": "no param action"}, status=status.HTTP_400_BAD_REQUEST)
        game.bullets += bullets
        if game.bullets < 0:
            game.bullets = 0
        game.save()
        return Response({"bullets": game.bullets}, status=status.HTTP_200_OK)


