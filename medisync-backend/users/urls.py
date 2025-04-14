from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_auth.registration.views import RegisterView
from rest_auth.views import LoginView, LogoutView, UserDetailsView
from .views import (
    CustomRegisterView,
    CustomUserDetailsView,
    UserViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', CustomRegisterView.as_view(), name='rest_register'),
    path('auth/login/', LoginView.as_view(), name='rest_login'),
    path('auth/logout/', LogoutView.as_view(), name='rest_logout'),
    path('auth/user/', CustomUserDetailsView.as_view(), name='rest_user_details'),
] 