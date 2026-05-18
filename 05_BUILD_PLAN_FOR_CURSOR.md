# Build Plan for Cursor AI

Use this as the implementation sequence.

## Phase 1 — Repository setup

Create a monorepo:

```text
vault-club/
  backend/
  frontend/
  docker-compose.yml
  README.md
  docs/
```

Backend:
- Django project: `config`
- Apps:
  - accounts
  - children
  - sports
  - scheduling
  - bookings
  - payments
  - notifications

Frontend:
- Next.js TypeScript app.
- Tailwind CSS.
- Shared API client.

## Phase 2 — Backend foundation

Implement:
- Custom User model using email login.
- Roles: parent, coach, admin, super_admin.
- ParentProfile and Child models.
- Sport, Venue, Coach, ActivityClass models.
- Django Admin registration for all models.
- DRF serializers/viewsets.
- Basic permissions.

Acceptance criteria:
- Admin can create sports, venues, coaches and classes.
- Parent can register, login and create child profiles.

## Phase 3 — Scheduling

Implement:
- ClassScheduleRule model.
- ClassOccurrence model.
- Management command to generate occurrences from schedule rules for the next 8 weeks.
- Public schedule API with filters.
- Capacity calculation.

Acceptance criteria:
- Admin can define recurring classes.
- System exposes weekly schedule with spots remaining.

## Phase 4 — Booking

Implement:
- Booking model.
- Booking creation endpoint.
- Transaction-safe capacity checks.
- Booking cancellation endpoint.
- Booking list for parent.

Acceptance criteria:
- Parent can book a child into a class.
- Capacity cannot be exceeded under concurrent requests.
- Duplicate active booking for same child/session is blocked.

## Phase 5 — Payments

Implement:
- Stripe Checkout Session creation.
- Payment model.
- Stripe webhook endpoint.
- Booking confirmation via webhook.
- Failed/expired payment handling.

Acceptance criteria:
- Parent can pay for a booking.
- Booking becomes confirmed only after verified Stripe webhook.
- Webhook handling is idempotent.

## Phase 6 — Frontend MVP

Implement pages:
- Home
- Auth
- Sports list
- Sport detail
- Weekly schedule
- My Kids dashboard
- Booking checkout
- Booking confirmation

Acceptance criteria:
- User can register, add child, browse schedule, book and pay.

## Phase 7 — Admin and coach workflows

Implement:
- Admin dashboard.
- Admin schedule management.
- Admin booking management.
- Coach class roster.
- Attendance capture.

Acceptance criteria:
- Admin can run daily operations without database access.
- Coach can mark attendance.

## Cursor prompt starter

```text
You are building the Vault Club booking app. Read all markdown files in /docs before coding. Implement the project incrementally according to 05_BUILD_PLAN_FOR_CURSOR.md. Use Django + DRF + PostgreSQL for the backend and Next.js + TypeScript + Tailwind for the frontend. Prioritise clean domain models, transaction-safe bookings, Stripe webhook correctness and simple admin workflows.
```
