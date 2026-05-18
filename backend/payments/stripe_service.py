from django.conf import settings

import stripe

from bookings.models import Booking
from payments.models import Payment


def _client():
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe


def create_checkout_for_booking(booking: Booking) -> tuple[Payment, str]:
    """Create Payment + Stripe Checkout Session. Returns (payment, checkout_url)."""
    if not settings.STRIPE_SECRET_KEY:
        raise RuntimeError("Stripe is not configured (STRIPE_SECRET_KEY).")

    parent = booking.parent
    payment = Payment.objects.create(
        parent=parent,
        amount=booking.price_amount,
        currency=booking.currency.lower(),
        status=Payment.Status.INITIATED,
        metadata_json={
            "booking_id": str(booking.id),
            "occurrence_id": str(booking.occurrence_id),
            "child_id": str(booking.child_id),
        },
        idempotency_key=f"booking-{booking.id}",
    )
    booking.payment = payment
    booking.save(update_fields=["payment"])

    sc = _client()
    session = sc.checkout.Session.create(
        mode="payment",
        customer_email=parent.user.email,
        client_reference_id=str(booking.id),
        success_url=f"{settings.FRONTEND_URL}/bookings/confirmation?booking_id={booking.id}",
        cancel_url=f"{settings.FRONTEND_URL}/bookings/new?occurrence={booking.occurrence_id}&cancelled=1",
        metadata={
            "booking_id": str(booking.id),
            "payment_id": str(payment.id),
        },
        line_items=[
            {
                "quantity": 1,
                "price_data": {
                    "currency": booking.currency.lower(),
                    "unit_amount": int(booking.price_amount),
                    "product_data": {
                        "name": f"{booking.occurrence.activity_class.title} — {booking.occurrence.starts_at:%Y-%m-%d %H:%M}",
                    },
                },
            }
        ],
    )
    payment.provider_checkout_session_id = session.id
    if session.payment_intent:
        payment.provider_payment_intent_id = str(session.payment_intent)
    payment.save(update_fields=["provider_checkout_session_id", "provider_payment_intent_id"])

    url = session.url
    if not url:
        raise RuntimeError("Stripe Checkout session missing URL.")
    return payment, url
