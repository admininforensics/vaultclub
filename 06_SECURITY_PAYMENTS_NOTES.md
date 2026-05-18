# Security, Booking Integrity and Payments Notes

## Authentication and authorisation
- Use secure password hashing via Django.
- Require email verification before allowing paid bookings if fraud risk becomes material.
- Use role-based permissions.
- Parents can access only their own children, bookings and payments.
- Coaches can access only assigned class rosters.
- Admins can manage operational data.

## Booking integrity
Booking creation must be atomic.

Recommended backend behaviour:
1. Start database transaction.
2. Lock class occurrence row.
3. Count active confirmed bookings.
4. Validate capacity.
5. Validate child eligibility.
6. Create booking as pending payment or confirmed if using credits.
7. Commit transaction.

For payment holds:
- Pending bookings can reserve capacity for a short period, e.g. 10 minutes.
- Expire unpaid pending bookings with Celery beat.

## Stripe rules
- Use Stripe Checkout to reduce PCI scope.
- Create a new Checkout Session for each payment attempt.
- Store Stripe checkout session ID and payment intent ID.
- Confirm payment only from verified webhook events.
- Use webhook idempotency to avoid double-confirming.
- Keep amount and currency on local Payment record.
- Do not trust client-submitted amounts.

## Refunds and cancellations
Define cancellation policy early:
- Free cancellation up to X hours before class.
- Late cancellation forfeits credit/payment.
- Admin override allowed.
- Refund to original payment method or issue class credit.

## Privacy
The app stores children’s personal information. Keep data minimal.

Sensitive fields:
- Child date of birth.
- Medical notes.
- Allergies.
- Emergency notes.

Controls:
- Limit access to authorised roles.
- Avoid exposing medical notes in public APIs.
- Log admin access where appropriate.
- Encrypt secrets and never commit `.env` files.

## Notifications
Initial MVP can use email notifications and manual WhatsApp links.

Later:
- WhatsApp Business API.
- Booking confirmation.
- Class cancellation.
- Payment receipt.
- Reminder before class.
