# API Specification

Base path: `/api/v1/`

## Auth

### POST /auth/register
Creates parent account.

Request:
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "password": "secure-password",
  "whatsapp_number": "+27821234567"
}
```

Response:
```json
{
  "user": { "id": "uuid", "email": "jane@example.com", "role": "parent" }
}
```

### POST /auth/login
### POST /auth/logout
### GET /auth/me

## Children

### GET /children
List current parent's children.

### POST /children
Create child profile.

### PATCH /children/{id}
Update child profile.

### DELETE /children/{id}
Soft-delete / deactivate child.

## Sports

### GET /sports
Public list of active sports.

### GET /sports/{slug}
Sport detail with related activity classes.

### POST /admin/sports
Admin create sport.

### PATCH /admin/sports/{id}
Admin update sport.

## Schedule

### GET /schedule
Query params:
- start_date
- end_date
- sport_id optional
- child_id optional
- age_filter optional

Response includes occurrences with capacity information.

```json
{
  "results": [
    {
      "id": "uuid",
      "sport": { "id": "uuid", "name": "Karate" },
      "activity_class": { "id": "uuid", "title": "Beginner Karate" },
      "starts_at": "2026-06-01T15:00:00+02:00",
      "ends_at": "2026-06-01T16:00:00+02:00",
      "venue": "Main Studio",
      "coach": "Coach Sam",
      "capacity": 20,
      "spots_remaining": 4,
      "price_amount": 15000,
      "currency": "ZAR",
      "status": "scheduled"
    }
  ]
}
```

## Bookings

### POST /bookings
Creates a pending booking or confirmed booking if paid using existing credits.

Request:
```json
{
  "occurrence_id": "uuid",
  "child_id": "uuid",
  "payment_method": "stripe_checkout"
}
```

Response:
```json
{
  "booking_id": "uuid",
  "status": "pending_payment",
  "checkout_url": "https://checkout.stripe.com/..."
}
```

### GET /bookings
List current parent's bookings.

### GET /bookings/{id}
Booking detail.

### POST /bookings/{id}/cancel
Cancel booking subject to cancellation rules.

## Payments

### POST /payments/create-checkout-session
Usually called internally from booking creation, but can also support package purchases.

### POST /webhooks/stripe
Receives Stripe webhook events.

Important:
- Verify Stripe webhook signature.
- Use idempotency keys.
- Never confirm bookings based only on redirect success URL.

## Admin

### GET /admin/bookings
Filter by date, sport, coach, status.

### GET /admin/occurrences
### POST /admin/occurrences
### PATCH /admin/occurrences/{id}
### POST /admin/occurrences/{id}/cancel

### GET /admin/schedule-rules
### POST /admin/schedule-rules
### PATCH /admin/schedule-rules/{id}

### GET /admin/payments
### GET /admin/reports/occupancy
### GET /admin/reports/revenue

## Coach

### GET /coach/classes
Assigned class occurrences.

### GET /coach/classes/{occurrence_id}/roster
Roster for a class.

### POST /coach/classes/{occurrence_id}/attendance
Submit attendance.
