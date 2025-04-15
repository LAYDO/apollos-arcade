from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.views import LoginView, LogoutView
from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.contrib import messages
from .forms import RegisterForm

class CustomLoginView(LoginView):
    template_name = "registration/login.html"

class CustomLogoutView(LogoutView):
    template_name = "registration/logout.html"
    next_page = reverse_lazy("home")
    http_method_names = ["get", "post", "head", "options"]  # Explicitly allow GET
    def get(self, request, *args, **kwargs):
        # Ensure user is logged out
        logout(request)
        messages.success(request, "You have been successfully logged out.")
        return super().get(request, *args, **kwargs)
