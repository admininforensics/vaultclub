import uuid

from django.db import models

from sports.models import Sport


class ShopProduct(models.Model):
    """Merchandise or supplies — category-wide or tied to one programme."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.CharField(
        max_length=20,
        choices=Sport.Category.choices,
        db_index=True,
    )
    programme = models.ForeignKey(
        Sport,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="shop_products",
        help_text="Leave empty for category-wide items (e.g. general sports gear).",
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    short_description = models.CharField(max_length=500, blank=True)
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    sku = models.CharField(max_length=64, blank=True)
    price_cents = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default="ZAR")
    display_order = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ["display_order", "name"]

    def __str__(self) -> str:
        scope = self.programme.name if self.programme_id else self.get_category_display()
        return f"{self.name} ({scope})"
