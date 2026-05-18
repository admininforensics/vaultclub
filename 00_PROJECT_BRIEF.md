# Vault Club Booking App — Project Brief

## Product vision
Build a full-stack web app for parents to discover, book, and pay for kids' sports activities, while giving club/activity organisers a portal to publish activities, manage schedules, capacity, bookings, payments, attendance, and communications.

## Prototype observations
The Lovable prototype positions the product as **Vault Club — Sports for kids who go all-in**. Core public routes observed:

- `/` landing page with sports discovery, parent account registration, schedule and club info.
- `/sports` sport browsing page: “Pick their sport”.
- `/schedule` weekly schedule page.
- `/dashboard` “My Kids” / authenticated dashboard placeholder.
- `/auth` parent account creation with name, WhatsApp number, email and password.
- `/about` club information.

Prototype copy indicates:

- Multi-sport kids club.
- 11 sports under one club.
- Parents register children, browse schedule, reserve spots.
- Supports single drop-in sessions and 10-class packages.
- Online secure payment.
- WhatsApp used for cancellations, photos and announcements.

## Core roles

1. **Visitor**
   - Browse sports, schedules and public club information.
   - Register or sign in.

2. **Parent / Guardian**
   - Manage own profile.
   - Add and manage child profiles.
   - Browse available classes.
   - Book spots for children.
   - Pay online.
   - View bookings, packages, credits, cancellations and attendance history.

3. **Coach / Activity Organiser**
   - View assigned classes.
   - Manage class attendance.
   - See roster and participant notes.
   - Optionally message parents via approved channels.

4. **Club Admin**
   - Manage sports, activities, venues, coaches, schedules, pricing, packages, capacity, bookings, payments, refunds, cancellations and users.

5. **Platform Super Admin**
   - If this becomes multi-tenant, manage clubs/organisations and subscriptions.

## Recommended MVP scope

### MVP must-have
- Authentication and role-based access.
- Parent profile and child profile management.
- Public sports catalogue.
- Weekly class schedule.
- Booking creation with capacity checks.
- Stripe Checkout payment flow.
- Booking status lifecycle.
- Admin CRUD for sports, venues, coaches, schedules and class occurrences.
- Admin booking and attendance view.
- Basic email/WhatsApp-ready notification hooks.

### MVP nice-to-have
- 10-class packages / credits.
- Waiting list.
- Cancellation window and refund/credit rules.
- Coach portal.
- Calendar export.

### Post-MVP
- Multi-tenant clubs.
- Recurring subscription memberships.
- WhatsApp Business API integration.
- Advanced reporting.
- Mobile app wrapper.
- Loyalty/referral system.

## Product principles
- Calendar-first: schedules and availability are central.
- Parent-first UX: a parent may manage multiple children.
- Booking integrity: avoid double booking and over-capacity.
- Payment integrity: booking confirmation should follow verified payment webhook events, not browser redirect alone.
- Admin simplicity: admins must be able to create weekly repeating classes without technical support.
