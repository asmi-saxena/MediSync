from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Ticket, TicketComment, TicketAttachment, TicketHistory
from .serializers import (
    TicketSerializer,
    TicketDetailSerializer,
    TicketCommentSerializer,
    TicketAttachmentSerializer,
    TicketHistorySerializer
)

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'super_admin':
            return Ticket.objects.all()
        elif user.role == 'hospital_admin':
            return Ticket.objects.filter(department__hospital=user.hospital)
        elif user.role == 'department_head':
            return Ticket.objects.filter(department=user.department)
        elif user.role == 'maintenance':
            return Ticket.objects.filter(assigned_to=user)
        return Ticket.objects.filter(created_by=user)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TicketDetailSerializer
        return TicketSerializer

    def perform_create(self, serializer):
        ticket = serializer.save(created_by=self.request.user)
        TicketHistory.objects.create(
            ticket=ticket,
            user=self.request.user,
            action='Ticket Created',
            details='Ticket was created'
        )

    def perform_update(self, serializer):
        ticket = serializer.save()
        TicketHistory.objects.create(
            ticket=ticket,
            user=self.request.user,
            action='Ticket Updated',
            details='Ticket details were updated'
        )

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        ticket = self.get_object()
        assigned_to_id = request.data.get('assigned_to_id')
        
        if not assigned_to_id:
            return Response(
                {'detail': 'Assigned user ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.assigned_to_id = assigned_to_id
        ticket.status = 'in_progress'
        ticket.save()

        TicketHistory.objects.create(
            ticket=ticket,
            user=request.user,
            action='Ticket Assigned',
            details=f'Ticket assigned to user ID: {assigned_to_id}'
        )

        serializer = self.get_serializer(ticket)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = 'resolved'
        ticket.actual_completion_date = timezone.now()
        ticket.save()

        TicketHistory.objects.create(
            ticket=ticket,
            user=request.user,
            action='Ticket Resolved',
            details='Ticket was marked as resolved'
        )

        serializer = self.get_serializer(ticket)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def department_tickets(self, request):
        department_id = request.query_params.get('department_id')
        if not department_id:
            return Response(
                {'detail': 'Department ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        tickets = Ticket.objects.filter(department_id=department_id)
        serializer = self.get_serializer(tickets, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending_tickets(self, request):
        tickets = self.get_queryset().filter(status='open')
        serializer = self.get_serializer(tickets, many=True)
        return Response(serializer.data)

class TicketCommentViewSet(viewsets.ModelViewSet):
    queryset = TicketComment.objects.all()
    serializer_class = TicketCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TicketComment.objects.filter(ticket_id=self.kwargs['ticket_pk'])

    def perform_create(self, serializer):
        ticket = Ticket.objects.get(pk=self.kwargs['ticket_pk'])
        comment = serializer.save(ticket=ticket, user=self.request.user)
        
        TicketHistory.objects.create(
            ticket=ticket,
            user=self.request.user,
            action='Comment Added',
            details=f'New comment added: {comment.comment[:50]}...'
        )

class TicketAttachmentViewSet(viewsets.ModelViewSet):
    queryset = TicketAttachment.objects.all()
    serializer_class = TicketAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TicketAttachment.objects.filter(ticket_id=self.kwargs['ticket_pk'])

    def perform_create(self, serializer):
        ticket = Ticket.objects.get(pk=self.kwargs['ticket_pk'])
        attachment = serializer.save(ticket=ticket, uploaded_by=self.request.user)
        
        TicketHistory.objects.create(
            ticket=ticket,
            user=self.request.user,
            action='Attachment Added',
            details=f'New attachment added: {attachment.description}'
        ) 