from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EquipmentViewSet, MaintenanceLogViewSet, SafetyCheckViewSet

router = DefaultRouter()
router.register(r'equipment', EquipmentViewSet, basename='equipment')
router.register(r'maintenance-logs', MaintenanceLogViewSet, basename='maintenance-log')
router.register(r'safety-checks', SafetyCheckViewSet, basename='safety-check')

urlpatterns = [
    path('', include(router.urls)),
] 