from datetime import date, timedelta

from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from bookings.models import Booking
from children.models import Child
from scheduling.models import ClassOccurrence


def child_age_on(dob: date, on: date) -> int:
    return on.year - dob.year - ((on.month, on.day) < (dob.month, dob.day))


def expire_stale_pending_bookings(occurrence: ClassOccurrence | None = None) -> int:
    hold = timedelta(minutes=settings.BOOKING_PAYMENT_HOLD_MINUTES)
    cutoff = timezone.now() - hold
    qs = Booking.objects.filter(
        status=Booking.Status.PENDING_PAYMENT,
        booked_at__lt=cutoff,
    )
    if occurrence is not None:
        qs = qs.filter(occurrence=occurrence)
    return qs.update(
        status=Booking.Status.CANCELLED,
        cancelled_at=timezone.now(),
        cancellation_reason="Payment hold expired",
    )


def count_reserved_spots(occurrence: ClassOccurrence, now=None) -> int:
    now = now or timezone.now()
    hold = timedelta(minutes=settings.BOOKING_PAYMENT_HOLD_MINUTES)
    expire_stale_pending_bookings(occurrence)
    return (
        Booking.objects.filter(occurrence=occurrence)
        .filter(
            Q(status__in=[Booking.Status.CONFIRMED, Booking.Status.ATTENDED])
            | Q(status=Booking.Status.PENDING_PAYMENT, booked_at__gte=now - hold)
        )
        .count()
    )


def spots_remaining(occurrence: ClassOccurrence, now=None) -> int:
    return max(0, occurrence.capacity - count_reserved_spots(occurrence, now=now))


def validate_child_eligibility(child: Child, occurrence: ClassOccurrence) -> str | None:
    ac = occurrence.activity_class
    if not child.active:
        return "Child profile is inactive."
    if occurrence.status != ClassOccurrence.Status.SCHEDULED:
        return "This session is not open for booking."
    now = timezone.now()
    if occurrence.starts_at <= now:
        return "This session has already started."
    if occurrence.booking_cutoff_at and now >= occurrence.booking_cutoff_at:
        return "Booking is closed for this session."
    if child.date_of_birth:
        on_date = occurrence.starts_at.date()
        age = child_age_on(child.date_of_birth, on_date)
        if ac.min_age is not None and age < ac.min_age:
            return "Child is below the minimum age for this class."
        if ac.max_age is not None and age > ac.max_age:
            return "Child is above the maximum age for this class."
    return None


def assert_no_duplicate_active_booking(child: Child, occurrence: ClassOccurrence, now=None) -> str | None:
    now = now or timezone.now()
    hold = timedelta(minutes=settings.BOOKING_PAYMENT_HOLD_MINUTES)
    exists = (
        Booking.objects.filter(child=child, occurrence=occurrence)
        .filter(
            Q(status__in=[Booking.Status.CONFIRMED, Booking.Status.ATTENDED, Booking.Status.WAITLISTED])
            | Q(status=Booking.Status.PENDING_PAYMENT, booked_at__gte=now - hold)
        )
        .exists()
    )
    if exists:
        return "This child already has an active booking for this session."
    return None


@transaction.atomic
def create_pending_booking(
    *,
    occurrence_id,
    child_id,
    parent_profile,
):
    """Create a pending_payment booking with capacity lock on occurrence row."""
    occurrence = (
        ClassOccurrence.objects.select_for_update()
        .select_related("activity_class")
        .get(pk=occurrence_id)
    )
    expire_stale_pending_bookings(occurrence)

    child = Child.objects.select_for_update().get(pk=child_id)
    if child.parent_id != parent_profile.id:
        raise PermissionError("Child does not belong to this parent.")

    if err := validate_child_eligibility(child, occurrence):
        raise ValueError(err)
    if err := assert_no_duplicate_active_booking(child, occurrence):
        raise ValueError(err)

    used = count_reserved_spots(occurrence)
    if used >= occurrence.capacity:
        raise ValueError("This class is full.")

    price = occurrence.price_cents or occurrence.activity_class.default_price_cents
    currency = occurrence.currency or occurrence.activity_class.currency

    booking = Booking.objects.create(
        occurrence=occurrence,
        child=child,
        parent=parent_profile,
        status=Booking.Status.PENDING_PAYMENT,
        price_amount=price,
        currency=currency,
    )
    return booking


def confirm_booking_after_payment(*, booking_id: str, payment) -> Booking:
    booking = Booking.objects.select_for_update().select_related("occurrence").get(pk=booking_id)
    if booking.payment_id and booking.payment_id != payment.id:
        raise ValueError("Booking already linked to a different payment.")
    if booking.status == Booking.Status.CONFIRMED:
        return booking
    if booking.status != Booking.Status.PENDING_PAYMENT:
        raise ValueError("Booking is not awaiting payment.")

    expire_stale_pending_bookings(booking.occurrence)
    used = count_reserved_spots(booking.occurrence)
    if used > booking.occurrence.capacity:
        raise ValueError("Capacity exceeded; cannot confirm booking.")

    booking.payment = payment
    booking.status = Booking.Status.CONFIRMED
    booking.save(update_fields=["payment", "status"])
    return booking


def cancel_booking_for_parent(booking: Booking, parent_profile, reason: str = "") -> Booking:
    if booking.parent_id != parent_profile.id:
        raise PermissionError("Not your booking.")
    if booking.status in (Booking.Status.CANCELLED,):
        return booking
    if booking.status in (Booking.Status.ATTENDED,):
        raise ValueError("Cannot cancel a completed attendance.")
    booking.status = Booking.Status.CANCELLED
    booking.cancelled_at = timezone.now()
    booking.cancellation_reason = reason or "Cancelled by parent"
    booking.save(update_fields=["status", "cancelled_at", "cancellation_reason"])
    return booking
