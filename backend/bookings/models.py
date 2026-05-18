import uuid

from django.conf import settings
from django.db import models

from accounts.models import ParentProfile
from children.models import Child
from scheduling.models import ClassOccurrence


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING_PAYMENT = "pending_payment", "Pending payment"
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"
        ATTENDED = "attended", "Attended"
        NO_SHOW = "no_show", "No show"
        WAITLISTED = "waitlisted", "Waitlisted"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    occurrence = models.ForeignKey(
        ClassOccurrence, on_delete=models.CASCADE, related_name="bookings"
    )
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name="bookings")
    parent = models.ForeignKey(
        ParentProfile, on_delete=models.CASCADE, related_name="bookings"
    )
    status = models.CharField(
        max_length=32,
        choices=Status.choices,
        default=Status.PENDING_PAYMENT,
        db_index=True,
    )
    price_amount = models.PositiveIntegerField(help_text="Amount in smallest currency unit")
    currency = models.CharField(max_length=3, default="ZAR")
    payment = models.ForeignKey(
        "payments.Payment",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bookings",
    )
    booked_at = models.DateTimeField(auto_now_add=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True)

    class Meta:
        ordering = ["-booked_at"]
        indexes = [
            models.Index(fields=["occurrence", "status"]),
        ]

    def __str__(self) -> str:
        return f"Booking {self.child} → {self.occurrence}"


class AttendanceRecord(models.Model):
    class Status(models.TextChoices):
        ATTENDED = "attended", "Attended"
        ABSENT = "absent", "Absent"
        EXCUSED = "excused", "Excused"
        NO_SHOW = "no_show", "No show"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.OneToOneField(
        Booking, on_delete=models.CASCADE, related_name="attendance"
    )
    status = models.CharField(max_length=20, choices=Status.choices)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="attendance_records_recorded",
    )
    recorded_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self) -> str:
        return f"Attendance {self.booking_id} ({self.status})"
