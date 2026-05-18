from django.conf import settings
from django.db import transaction
from django.http import HttpResponse, HttpResponseBadRequest
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

import stripe

from bookings.services import confirm_booking_after_payment
from payments.models import Payment


@csrf_exempt
@require_POST
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

    if not settings.STRIPE_WEBHOOK_SECRET:
        return HttpResponseBadRequest("Webhook not configured")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return HttpResponseBadRequest("Invalid payload")
    except stripe.error.SignatureVerificationError:
        return HttpResponseBadRequest("Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        _handle_checkout_completed(session, event_id=event["id"])

    return HttpResponse(status=200)


@transaction.atomic
def _handle_checkout_completed(session: dict, event_id: str):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    metadata = session.get("metadata") or {}
    booking_id = metadata.get("booking_id")
    payment_id = metadata.get("payment_id")

    if not booking_id or not payment_id:
        return

    payment = Payment.objects.select_for_update().get(pk=payment_id)
    if payment.status == Payment.Status.PAID:
        return

    if payment.metadata_json.get("stripe_event_id") == event_id:
        return

    confirm_booking_after_payment(booking_id=str(booking_id), payment=payment)

    payment.status = Payment.Status.PAID
    payment.paid_at = timezone.now()
    payment.metadata_json = {
        **payment.metadata_json,
        "stripe_event_id": event_id,
        "checkout_session": session.get("id"),
    }
    payment.save(update_fields=["status", "paid_at", "metadata_json"])
