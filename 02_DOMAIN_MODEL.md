# Domain Model

## Key entities

### User
Represents login identity.

Fields:
- id
- email
- password_hash
- first_name
- last_name
- phone_number
- role: parent, coach, admin, super_admin
- is_active
- created_at
- updated_at

### ParentProfile
Fields:
- id
- user_id
- whatsapp_number
- emergency_contact_name
- emergency_contact_phone
- marketing_opt_in

### Child
Fields:
- id
- parent_id
- first_name
- last_name
- date_of_birth
- gender optional
- medical_notes
- allergies
- emergency_notes
- active

### Sport
Examples: artistic gymnastics, ninja course, karate.

Fields:
- id
- name
- slug
- short_description
- long_description
- image_url
- min_age
- max_age
- active
- display_order

### Venue
Fields:
- id
- name
- address
- room_or_court
- capacity_notes
- active

### Coach
Fields:
- id
- user_id
- bio
- qualifications
- active

### ActivityClass
Represents the class template, e.g. “Beginner Karate Ages 7–10”.

Fields:
- id
- sport_id
- title
- description
- min_age
- max_age
- default_capacity
- default_duration_minutes
- skill_level: beginner, intermediate, advanced, mixed
- active

### ClassScheduleRule
Represents recurring schedule definition.

Fields:
- id
- activity_class_id
- venue_id
- coach_id
- weekday
- start_time
- end_time
- recurrence_start_date
- recurrence_end_date optional
- capacity_override optional
- active

### ClassOccurrence
Represents a specific bookable event instance.

Fields:
- id
- schedule_rule_id optional
- activity_class_id
- venue_id
- coach_id
- starts_at
- ends_at
- capacity
- status: scheduled, cancelled, completed
- cancellation_reason
- booking_cutoff_at
- created_at
- updated_at

### Booking
Represents a child booked into a class occurrence.

Fields:
- id
- occurrence_id
- child_id
- parent_id
- status: pending_payment, confirmed, cancelled, attended, no_show, waitlisted
- price_amount
- currency
- payment_id optional
- package_credit_id optional
- booked_at
- cancelled_at optional
- cancellation_reason optional

Constraints:
- A child cannot have more than one active booking for the same occurrence.
- Confirmed bookings cannot exceed occurrence capacity.

### Payment
Fields:
- id
- parent_id
- provider: stripe
- provider_checkout_session_id
- provider_payment_intent_id
- amount
- currency
- status: initiated, paid, failed, refunded, partially_refunded
- metadata_json
- created_at
- paid_at optional

### PackageProduct
Examples: single class, 10-class package.

Fields:
- id
- name
- description
- sport_id optional
- number_of_credits
- price_amount
- currency
- expires_after_days
- active

### CreditLedgerEntry
Tracks credit purchases and usage.

Fields:
- id
- parent_id
- child_id optional
- package_product_id optional
- booking_id optional
- entry_type: purchase, redemption, refund, expiry, adjustment
- credit_delta
- balance_after
- expires_at optional
- notes
- created_at

### AttendanceRecord
Fields:
- id
- booking_id
- status: attended, absent, excused, no_show
- recorded_by_user_id
- recorded_at
- notes

### NotificationLog
Fields:
- id
- recipient_user_id
- channel: email, whatsapp, sms
- template_key
- status: queued, sent, failed
- provider_message_id
- payload_json
- created_at
- sent_at optional

## Booking status lifecycle

1. Parent selects child and class occurrence.
2. System creates booking as `pending_payment` if immediate payment is required.
3. System creates Stripe Checkout Session.
4. Parent pays on Stripe.
5. Stripe webhook confirms payment.
6. System marks payment `paid` and booking `confirmed`.
7. Coach/admin marks attendance.
8. Booking becomes `attended`, `no_show` or remains `confirmed`.

## Capacity rule

Only these statuses count against capacity:
- confirmed
- attended

Potentially count `pending_payment` for a short hold period, for example 10 minutes, to avoid payment race conditions.
