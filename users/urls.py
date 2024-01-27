from django.urls import path
from django.contrib.auth import views as auth_views
from users import views

urlpatterns = [
    path('register/', views.registration_view, name="register"),
    path('login/', views.login_view, name="login"),
    path('logout/', views.logout_view, name="logout"),

]
