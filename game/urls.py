from django.urls import path

from . import views

urlpatterns = [
    path("", views.GamesListView.as_view(), name="home"),
    path('games/<int:pk>/', views.GameFieldView.as_view(), name='game_detail'),
    path('games/create/', views.CreateGameFieldView, name='create_game'),
    path('api/games/create/', views.GameFieldAPIView.as_view()),
    path('api/games/<int:pk>/', views.GameFieldAPIView.as_view()),
    path('api/games/<int:pk>/shoot/', views.ShootAPIView.as_view()),
    path('api/games/<int:pk>/bullet/', views.BulletControlAPIView.as_view()),

]