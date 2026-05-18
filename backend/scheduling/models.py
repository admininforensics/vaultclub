import uuid

from django.db import models

from sports.models import ActivityClass, Coach, Venue


class ClassScheduleRule(models.Model):
    class Weekday(models.IntegerChoices):
        MONDAY = 0, "Monday"
        TUESDAY = 1, "Tuesday"
        WEDNESDAY = 2, "Wednesday"
        THURSDAY = 3, "Thursday"
        FRIDAY = 4, "Friday"
        SATURDAY = 5, "Saturday"
        SUNDAY = 6, "Sunday"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    activity_class = models.ForeignKey(
        ActivityClass, on_delete=models.CASCADE, related_name="schedule_rules"
    )
    venue = models.ForeignKey(Venue, on_delete=models.PROTECT, related_name="schedule_rules")
    coach = models.ForeignKey(
        Coach, on_delete=models.SET_NULL, null=True, blank=True, related_name="schedule_rules"
    )
    weekday = models.IntegerField(choices=Weekday.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    recurrence_start_date = models.DateField()
    recurrence_end_date = models.DateField(null=True, blank=True)
    capacity_override = models.PositiveIntegerField(null=True, blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["weekday", "start_time"]

    def __str__(self) -> str:
        return f"{self.activity_class} — {self.get_weekday_display()} {self.start_time}"


class ClassOccurrence(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Scheduled"
        CANCELLED = "cancelled", "Cancelled"
        COMPLETED = "completed", "Completed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    schedule_rule = models.ForeignKey(
        ClassScheduleRule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="occurrences",
    )
    activity_class = models.ForeignKey(
        ActivityClass, on_delete=models.CASCADE, related_name="occurrences"
    )
    venue = models.ForeignKey(Venue, on_delete=models.PROTECT, related_name="occurrences")
    coach = models.ForeignKey(
        Coach, on_delete=models.SET_NULL, null=True, blank=True, related_name="occurrences"
    )
    starts_at = models.DateTimeField(db_index=True)
    ends_at = models.DateTimeField()
    capacity = models.PositiveIntegerField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED,
        db_index=True,
    )
    cancellation_reason = models.TextField(blank=True)
    booking_cutoff_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Optional; bookings blocked after this instant.",
    )
    price_cents = models.PositiveIntegerField(default=0)
    currency = models.CharField(max_length=3, default="ZAR")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["starts_at"]
        indexes = [
            models.Index(fields=["starts_at", "status"]),
        ]

    def __str__(self) -> str:
        return f"{self.activity_class} @ {self.starts_at}"
