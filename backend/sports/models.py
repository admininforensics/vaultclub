import uuid

from django.conf import settings
from django.db import models


class ProgramCategory(models.TextChoices):
    SPORTS = "sports", "Sports"
    MUSIC = "music", "Music lessons"
    TUTORING = "tutoring", "Tutoring"


class ProgramSubcategory(models.Model):
    """Grouping within a programme category (e.g. Rugby under Sports, Piano under Music)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.CharField(
        max_length=20,
        choices=ProgramCategory.choices,
        db_index=True,
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    display_order = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ["display_order", "name"]
        verbose_name = "programme subcategory"
        verbose_name_plural = "programme subcategories"
        constraints = [
            models.UniqueConstraint(
                fields=["category", "slug"],
                name="unique_subcategory_slug_per_category",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.get_category_display()}: {self.name}"


class Sport(models.Model):
    """Bookable programme (sport, music instrument, tutoring subject, etc.)."""

    Category = ProgramCategory

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.CharField(
        max_length=20,
        choices=ProgramCategory.choices,
        default=ProgramCategory.SPORTS,
        db_index=True,
    )
    subcategory = models.ForeignKey(
        ProgramSubcategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="programmes",
    )
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
        verbose_name = "programme"
        verbose_name_plural = "programmes"

    def __str__(self) -> str:
        return self.name


class Venue(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    city = models.CharField(
        max_length=255,
        blank=True,
        db_index=True,
        help_text="City or suburb for geo filtering.",
    )
    address = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    maps_url = models.URLField(blank=True, help_text="Google Maps link for directions.")
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
    photo_url = models.URLField(blank=True)
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
