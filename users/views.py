from django.shortcuts import render

# Create your views here.
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import HttpResponse

from django.shortcuts import render, redirect

# Create your views here.
from django.urls import reverse

from users.forms import RegistrationForm, UserLoginForm


def home_screen_view(request):
    context = {}
    redirect_url = reverse('games_list')
    return redirect(redirect_url)  # На домашней странице должны отображаться доступные


def registration_view(request):
    form = RegistrationForm()

    if request.POST:
        form = RegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data['username']
            raw_password = form.cleaned_data['password1']
            account = authenticate(request, username=username, password=raw_password)
            if account:
                login(request, account)
                return redirect('home')

    return render(request, 'users/register.html', {'form': form})


def login_view(request):
    context = {}

    user = request.user
    if user.is_authenticated:
        return redirect("home")

    if request.POST:
        form = UserLoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]
            user = authenticate(request, username=username, password=password)
            if user:
                if user.is_active:
                    login(request, user)
                    return redirect("home")
                else:
                    return HttpResponse("Пожалуйста свяжитесь с администратором для активации аккаунта!")

    else:
        form = UserLoginForm()

    context['login_form'] = form

    return render(request, "users/login.html", context)


def logout_view(request):
    logout(request)
    return redirect('/')

