# Stack Recommendation

## Recommended stack: Django + Django REST Framework + PostgreSQL + React/Next.js

Given the product is booking/payment/admin heavy, the recommended stack is:

### Backend
- Python 3.12+
- Django 5.2 LTS
- Django REST Framework
- PostgreSQL
- Celery + Redis for background tasks
- Django Admin for fast internal admin tooling
- Stripe Checkout + Stripe webhooks
- Optional: django-allauth or custom JWT/session auth

### Frontend
- Next.js with TypeScript
- Tailwind CSS
- shadcn/ui or equivalent component library
- TanStack Query for API state
- Zod for validation
- FullCalendar or custom calendar views

### Infrastructure
- Docker Compose for local development
- Production options:
  - Render / Fly.io / Railway for simple deployment
  - AWS ECS / Lightsail / Elastic Beanstalk for more control
  - Supabase / Neon / RDS for PostgreSQL
- Object storage: S3-compatible storage for photos/documents if needed
- Error monitoring: Sentry

## Why Django fits this app
Django is a strong fit because the app is data-model heavy, permission heavy, admin heavy and transactional. The built-in admin will save weeks of build time for managing sports, venues, schedules, coaches, bookings and payments.

## Alternative stack: full TypeScript
Use this if the team strongly prefers one language end-to-end:

- Next.js / React
- NestJS or Next.js API routes
- PostgreSQL
- Prisma ORM
- Auth.js / Clerk / Supabase Auth
- Stripe

This can work well, but for this specific app Django is likely faster and safer for a robust admin backend.

## Suggested decision
Use **Django backend + Next.js frontend**.

This gives:
- Strong backend domain modelling.
- Excellent admin portal from day one.
- Modern responsive user interface.
- Clean API boundary.
- Good long-term maintainability.
