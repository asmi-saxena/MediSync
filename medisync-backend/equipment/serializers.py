from rest_framework import serializers
from .models import Equipment, MaintenanceLog, SafetyCheck
from users.serializers import UserSerializer
from hospitals.serializers import DepartmentSerializer

class EquipmentSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.IntegerField(write_only=True)
    assigned_to = UserSerializer(read_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Equipment
        fields = ('id', 'name', 'model_number', 'serial_number', 'department', 'department_id',
                 'status', 'status_display', 'purchase_date', 'warranty_expiry',
                 'last_maintenance_date', 'next_maintenance_date', 'maintenance_interval_days',
                 'manufacturer', 'description', 'specifications', 'location',
                 'assigned_to', 'assigned_to_id', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class MaintenanceLogSerializer(serializers.ModelSerializer):
    equipment = EquipmentSerializer(read_only=True)
    equipment_id = serializers.IntegerField(write_only=True)
    performed_by = UserSerializer(read_only=True)
    performed_by_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = MaintenanceLog
        fields = ('id', 'equipment', 'equipment_id', 'maintenance_type', 'description',
                 'performed_by', 'performed_by_id', 'maintenance_date', 'next_maintenance_date',
                 'cost', 'notes', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class SafetyCheckSerializer(serializers.ModelSerializer):
    equipment = EquipmentSerializer(read_only=True)
    equipment_id = serializers.IntegerField(write_only=True)
    checked_by = UserSerializer(read_only=True)
    checked_by_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = SafetyCheck
        fields = ('id', 'equipment', 'equipment_id', 'check_date', 'checked_by',
                 'checked_by_id', 'safety_status', 'issues_found', 'corrective_actions',
                 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class EquipmentDetailSerializer(EquipmentSerializer):
    maintenance_logs = MaintenanceLogSerializer(many=True, read_only=True)
    safety_checks = SafetyCheckSerializer(many=True, read_only=True)
    ticket_count = serializers.SerializerMethodField()

    class Meta(EquipmentSerializer.Meta):
        fields = EquipmentSerializer.Meta.fields + ('maintenance_logs', 'safety_checks', 'ticket_count')

    def get_ticket_count(self, obj):
        return obj.tickets.count() 