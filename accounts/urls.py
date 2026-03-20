from django.urls import path
from .views import RegisterView, LoginView, ProfileView
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register_page, name='register-page'),
    path('profile/', views.profile_page, name='profile-page'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/profile/', ProfileView.as_view(), name='profile'),
]