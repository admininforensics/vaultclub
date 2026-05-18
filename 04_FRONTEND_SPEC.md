# Frontend Specification

## Main user-facing pages

### Home `/`
Purpose: public marketing landing page.

Sections:
- Hero: “Sports for kids who go all-in.”
- CTA buttons: Register your kid, Browse sports.
- Sports roster preview.
- Parent feature cards: Register, Schedules, Club info.
- How it works: Pick a class, Pay your way, Stay in the loop.

### Auth `/auth`
Modes:
- Register parent account.
- Sign in.
- Forgot password.

Fields for registration:
- First name
- Last name
- WhatsApp number
- Email
- Password

### Sports `/sports`
Purpose: browse sports.

Features:
- Sport tiles/cards.
- Search/filter by age, day, skill level.
- Click sport to see classes and schedule.

### Sport detail `/sports/[slug]`
Features:
- Sport description.
- Age range.
- Available classes.
- Upcoming bookable sessions.
- Book button.

### Weekly schedule `/schedule`
Purpose: calendar-first booking view.

Features:
- Week navigation.
- Filters: sport, child, age suitability, coach, venue.
- Day columns or list view on mobile.
- Each occurrence card shows time, sport, class, coach, venue, spots left and price.
- Booking CTA.

### My Kids `/dashboard` or `/my-kids`
Features:
- Parent profile summary.
- Child cards.
- Add/edit child.
- Upcoming bookings.
- Package credits.
- Booking history.

### Booking checkout `/bookings/new?occurrence=...`
Flow:
1. Select child.
2. Confirm class details.
3. Choose payment type: single session or package credits if available.
4. Accept terms/cancellation policy.
5. Continue to Stripe Checkout or confirm using credits.

### Booking confirmation `/bookings/confirmation`
Features:
- Success message.
- Booking detail.
- Add to calendar.
- WhatsApp/email confirmation note.

## Admin portal pages

### Admin dashboard `/admin`
Summary cards:
- Today's classes.
- Bookings this week.
- Revenue this month.
- Capacity utilisation.

### Admin sports `/admin/sports`
CRUD sports.

### Admin classes `/admin/classes`
CRUD activity class templates.

### Admin schedule `/admin/schedule`
Manage recurring rules and generated occurrences.

### Admin bookings `/admin/bookings`
Search/filter bookings and update statuses.

### Admin payments `/admin/payments`
View payment status, Stripe IDs and refund status.

### Coach portal `/coach`
Coach views assigned classes and marks attendance.

## UX rules
- Mobile-first design.
- Parent should complete booking in under 60 seconds once registered.
- Always show spots remaining.
- Prevent booking if child is outside the age range, unless admin override is enabled.
- Clearly distinguish pending payment from confirmed bookings.
- Use optimistic UI carefully; final booking confirmation depends on backend response and payment webhook.
