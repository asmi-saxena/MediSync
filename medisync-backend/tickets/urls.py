from django.urls import path, include
from rest_framework_nested import routers
from .views import TicketViewSet, TicketCommentViewSet, TicketAttachmentViewSet

router = routers.SimpleRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')

tickets_router = routers.NestedSimpleRouter(router, r'tickets', lookup='ticket')
tickets_router.register(r'comments', TicketCommentViewSet, basename='ticket-comment')
tickets_router.register(r'attachments', TicketAttachmentViewSet, basename='ticket-attachment')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(tickets_router.urls)),
] 