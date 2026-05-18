import uuid

from django.conf import settings
from django.db import models


class Sport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    short_description = models.CharField(max_length=500, blank=True)
    long_description = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    min_age = models.PositiveSmallIntegerField(null=True, blank=True)
    max_age = models.PositiveSmallIntegerField(null=True, blank=True)
    active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "name"]

    def __str__(self) -> str:
        return self.name


class Venue(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True)
    room_or_court = models.CharField(max_length=255, blank=True)
    capacity_notes = models.CharField(max_length=500, blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "venues"

    def __str__(self) -> str:
        return self.name


class Coach(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="coach_profile",
    )
    bio = models.TextField(blank=True)
    qualifications = models.TextField(blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "coaches"

    def __str__(self) -> str:
        return self.user.get_full_name() or str(self.user.email)


class ActivityClass(models.Model):
    class SkillLevel(models.TextChoices):
        BEGINNER = "beginner", "Beginner"
        INTERMEDIATE = "intermediate", "Intermediate"
        ADVANCED = "advanced", "Advanced"
        MIXED = "mixed", "Mixed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sport = models.ForeignKey(
        Sport, on_delete=models.CASCADE, related_name="activity_classes"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    min_age = models.PositiveSmallIntegerField(null=True, blank=True)
    max_age = models.PositiveSmallIntegerField(null=True, blank=True)
    default_capacity = models.PositiveIntegerField(default=12)
    default_duration_minutes = models.PositiveIntegerField(default=60)
    skill_level = models.CharField(
        max_length=20,
        choices=SkillLevel.choices,
        default=SkillLevel.MIXED,
    )
    active = models.BooleanField(default=True)
    default_price_cents = models.PositiveIntegerField(
        default=15000,
        help_text="Smallest currency unit (e.g. cents for ZAR)",
    )
    currency = models.CharField(max_length=3, default="ZAR")

    class Meta:
        verbose_name_plural = "activity classes"

    def __str__(self) -> str:
        return f"{self.sport.name}: {self.title}"
