from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate

from users.models import CustomUser


class RegistrationForm(UserCreationForm):
    email = forms.EmailField(max_length=254, help_text='', widget=forms.EmailInput)

    class Meta:
        model = CustomUser
        fields = ('username', 'email','password1','password2')

    def clean_password2(self):
        cd = self.cleaned_data
        if cd['password1'] != cd['password2']:
            raise forms.ValidationError('Пароли не совпадают')
        return cd['password2']

class UserLoginForm(forms.Form):
    username = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput)

    def clean(self, *args, **kwargs):

        username = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise forms.ValidationError('Не верный логин или пароль!')
            elif not user.is_active:
                raise forms.ValidationError('Пожалуйста активируйте ваш аккаунт')
        return super().clean()