from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_auth.registration.serializers import RegisterSerializer
from rest_auth.serializers import UserDetailsSerializer

User = get_user_model()

class CustomRegisterSerializer(RegisterSerializer):
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)
    phone_number = serializers.CharField(max_length=15, required=False)
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        required=False,
        allow_null=True
    )
    hospital = serializers.PrimaryKeyRelatedField(
        queryset=Hospital.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'phone_number', 'department', 'hospital')

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data.update({
            'role': self.validated_data.get('role', ''),
            'phone_number': self.validated_data.get('phone_number', ''),
            'department': self.validated_data.get('department', None),
            'hospital': self.validated_data.get('hospital', None),
        })
        return data

class CustomUserDetailsSerializer(UserDetailsSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone_number', 'department', 'hospital', 'is_active')
        read_only_fields = ('id', 'username', 'email')

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone_number', 'department', 'hospital', 'is_active')
        read_only_fields = ('id', 'username', 'email')

class UserProfileSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone_number', 'department', 'department_name', 
                 'hospital', 'hospital_name', 'is_active')
        read_only_fields = ('id', 'username', 'email') 