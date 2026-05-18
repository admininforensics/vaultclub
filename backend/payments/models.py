import uuid

from django.db import models

from accounts.models import ParentProfile


class Payment(models.Model):
    class Status(models.TextChoices):
        INITIATED = "initiated", "Initiated"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"
        PARTIALLY_REFUNDED = "partially_refunded", "Partially refunded"

    class Provider(models.TextChoices):
        STRIPE = "stripe", "Stripe"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent = models.ForeignKey(
        ParentProfile, on_delete=models.CASCADE, related_name="payments"
    )
    provider = models.CharField(
        max_length=32, choices=Provider.choices, default=Provider.STRIPE
    )
    provider_checkout_session_id = models.CharField(max_length=255, blank=True, db_index=True)
    provider_payment_intent_id = models.CharField(max_length=255, blank=True, db_index=True)
    amount = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default="ZAR")
    status = models.CharField(
        max_length=32,
        choices=Status.choices,
        default=Status.INITIATED,
        db_index=True,
    )
    metadata_json = models.JSONField(default=dict, blank=True)
    idempotency_key = models.CharField(max_length=255, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Payment {self.amount} {self.currency} ({self.status})"


class PackageProduct(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    sport = models.ForeignKey(
        "sports.Sport",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="package_products",
    )
    number_of_credits = models.PositiveIntegerField(default=1)
    price_amount = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default="ZAR")
    expires_after_days = models.PositiveIntegerField(null=True, blank=True)
    active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return self.name


class CreditLedgerEntry(models.Model):
    class EntryType(models.TextChoices):
        PURCHASE = "purchase", "Purchase"
        REDEMPTION = "redemption", "Redemption"
        REFUND = "refund", "Refund"
        EXPIRY = "expiry", "Expiry"
        ADJUSTMENT = "adjustment", "Adjustment"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent = models.ForeignKey(
        ParentProfile, on_delete=models.CASCADE, related_name="credit_ledger"
    )
    child = models.ForeignKey(
        "children.Child",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="credit_ledger",
    )
    package_product = models.ForeignKey(
        PackageProduct,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ledger_entries",
    )
    booking = models.ForeignKey(
        "bookings.Booking",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="credit_ledger_entries",
    )
    entry_type = models.CharField(max_length=20, choices=EntryType.choices)
    credit_delta = models.IntegerField()
    balance_after = models.IntegerField()
    expires_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "credit ledger entries"
