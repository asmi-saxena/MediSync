from rest_framework import serializers
from .models import Ticket, TicketComment, TicketAttachment, TicketHistory
from users.serializers import UserSerializer
from equipment.serializers import EquipmentSerializer
from hospitals.serializers import DepartmentSerializer

class TicketCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = TicketComment
        fields = ('id', 'ticket', 'user', 'user_id', 'comment', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class TicketAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    uploaded_by_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = TicketAttachment
        fields = ('id', 'ticket', 'file', 'uploaded_by', 'uploaded_by_id', 'description', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at')

class TicketHistorySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = TicketHistory
        fields = ('id', 'ticket', 'user', 'user_id', 'action', 'details', 'created_at')
        read_only_fields = ('id', 'created_at')

class TicketSerializer(serializers.ModelSerializer):
    equipment = EquipmentSerializer(read_only=True)
    equipment_id = serializers.IntegerField(write_only=True)
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.IntegerField(write_only=True)
    created_by = UserSerializer(read_only=True)
    created_by_id = serializers.IntegerField(write_only=True)
    assigned_to = UserSerializer(read_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    ticket_type_display = serializers.CharField(source='get_ticket_type_display', read_only=True)

    class Meta:
        model = Ticket
        fields = ('id', 'title', 'description', 'ticket_type', 'ticket_type_display',
                 'priority', 'priority_display', 'status', 'status_display',
                 'equipment', 'equipment_id', 'department', 'department_id',
                 'created_by', 'created_by_id', 'assigned_to', 'assigned_to_id',
                 'estimated_completion_date', 'actual_completion_date',
                 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class TicketDetailSerializer(TicketSerializer):
    comments = TicketCommentSerializer(many=True, read_only=True)
    attachments = TicketAttachmentSerializer(many=True, read_only=True)
    history = TicketHistorySerializer(many=True, read_only=True)

    class Meta(TicketSerializer.Meta):
        fields = TicketSerializer.Meta.fields + ('comments', 'attachments', 'history') 