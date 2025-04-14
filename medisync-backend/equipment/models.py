from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Equipment(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('maintenance', 'Under Maintenance'),
        ('faulty', 'Faulty'),
        ('retired', 'Retired'),
    )

    name = models.CharField(max_length=200)
    model_number = models.CharField(max_length=100)
    serial_number = models.CharField(max_length=100, unique=True)
    department = models.ForeignKey('hospitals.Department', on_delete=models.CASCADE, related_name='equipment')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    purchase_date = models.DateField()
    warranty_expiry = models.DateField()
    last_maintenance_date = models.DateField(null=True, blank=True)
    next_maintenance_date = models.DateField(null=True, blank=True)
    maintenance_interval_days = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Number of days between routine maintenance"
    )
    manufacturer = models.CharField(max_length=200)
    description = models.TextField()
    specifications = models.JSONField(default=dict)
    location = models.CharField(max_length=200)
    assigned_to = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.serial_number}"

    class Meta:
        verbose_name = 'Equipment'
        verbose_name_plural = 'Equipment'
        ordering = ['name']
        unique_together = ['serial_number', 'hospital']

class MaintenanceLog(models.Model):
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='maintenance_logs')
    maintenance_type = models.CharField(max_length=50)  # Routine, Preventive, Corrective
    description = models.TextField()
    performed_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    maintenance_date = models.DateField()
    next_maintenance_date = models.DateField()
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.equipment.name} - {self.maintenance_type} - {self.maintenance_date}"

    class Meta:
        verbose_name = 'Maintenance Log'
        verbose_name_plural = 'Maintenance Logs'
        ordering = ['-maintenance_date']

class SafetyCheck(models.Model):
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='safety_checks')
    check_date = models.DateField()
    checked_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    safety_status = models.CharField(max_length=50)
    issues_found = models.TextField(blank=True)
    corrective_actions = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.equipment.name} - {self.check_date}"

    class Meta:
        verbose_name = 'Safety Check'
        verbose_name_plural = 'Safety Checks'
        ordering = ['-check_date'] 