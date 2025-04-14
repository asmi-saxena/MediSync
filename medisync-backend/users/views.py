from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer,
    UserProfileSerializer,
    CustomUserDetailsSerializer,
    CustomRegisterSerializer
)
from rest_auth.registration.views import RegisterView
from rest_auth.views import UserDetailsView

User = get_user_model()

class CustomRegisterView(RegisterView):
    serializer_class = CustomRegisterSerializer

class CustomUserDetailsView(UserDetailsView):
    serializer_class = CustomUserDetailsSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        if user.role == 'super_admin':
            return User.objects.all()
        elif user.role == 'hospital_admin':
            return User.objects.filter(hospital=user.hospital)
        return User.objects.filter(id=user.id)

    @action(detail=False, methods=['get'])
    def profile(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def department_users(self, request):
        if request.user.role not in ['hospital_admin', 'department_head']:
            return Response(
                {'detail': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        department_id = request.query_params.get('department_id')
        if not department_id:
            return Response(
                {'detail': 'Department ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        users = User.objects.filter(department_id=department_id)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def hospital_users(self, request):
        if request.user.role != 'hospital_admin':
            return Response(
                {'detail': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        users = User.objects.filter(hospital=request.user.hospital)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data) 