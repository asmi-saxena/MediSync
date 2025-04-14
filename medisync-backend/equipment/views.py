from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import Equipment, MaintenanceLog, SafetyCheck
from .serializers import (
    EquipmentSerializer,
    EquipmentDetailSerializer,
    MaintenanceLogSerializer,
    SafetyCheckSerializer
)

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'super_admin':
            return Equipment.objects.all()
        elif user.role == 'hospital_admin':
            return Equipment.objects.filter(department__hospital=user.hospital)
        elif user.role == 'department_head':
            return Equipment.objects.filter(department=user.department)
        return Equipment.objects.filter(assigned_to=user)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EquipmentDetailSerializer
        return EquipmentSerializer

    @action(detail=False, methods=['get'])
    def department_equipment(self, request):
        department_id = request.query_params.get('department_id')
        if not department_id:
            return Response(
                {'detail': 'Department ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        equipment = Equipment.objects.filter(department_id=department_id)
        serializer = self.get_serializer(equipment, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def maintenance_due(self, request):
        today = timezone.now().date()
        equipment = self.get_queryset().filter(
            next_maintenance_date__lte=today + timedelta(days=7)
        )
        serializer = self.get_serializer(equipment, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def warranty_expiring(self, request):
        today = timezone.now().date()
        equipment = self.get_queryset().filter(
            warranty_expiry__lte=today + timedelta(days=30)
        )
        serializer = self.get_serializer(equipment, many=True)
        return Response(serializer.data)

class MaintenanceLogViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceLog.objects.all()
    serializer_class = MaintenanceLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['super_admin', 'hospital_admin']:
            return MaintenanceLog.objects.all()
        return MaintenanceLog.objects.filter(
            equipment__department=user.department
        )

    def perform_create(self, serializer):
        serializer.save(performed_by=self.request.user)

class SafetyCheckViewSet(viewsets.ModelViewSet):
    queryset = SafetyCheck.objects.all()
    serializer_class = SafetyCheckSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['super_admin', 'hospital_admin']:
            return SafetyCheck.objects.all()
        return SafetyCheck.objects.filter(
            equipment__department=user.department
        )

    def perform_create(self, serializer):
        serializer.save(checked_by=self.request.user) 