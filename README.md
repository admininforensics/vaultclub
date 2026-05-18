# Vault Club

Monorepo for the **Vault Club** kids sports booking product: Django + DRF + PostgreSQL backend, Next.js + TypeScript + Tailwind frontend.

## Quick start (local)

### 1. Database with Docker (local Postgres)

From the **repo root** (where `docker-compose.yml` lives):

```bash
# Start Postgres (and optional Redis) in the background
docker compose up -d db

# See logs if something fails
docker compose logs -f db

# Stop containers (data is kept in the named volume `pgdata`)
docker compose stop

# Remove containers but keep the volume (database files)
docker compose down

# Wipe the database volume and start clean (destructive)
docker compose down -v
```

Connection string for `backend/.env`:

```env
DATABASE_URL=postgresql://vaultclub:vaultclub@127.0.0.1:5432/vaultclub
```

Then:

```bash
cp backend/.env.example backend/.env
# Edit backend/.env if needed, then:
cd backend && python manage.py migrate && python manage.py seed_demo
```

Without Docker and without `DATABASE_URL`, the API uses **SQLite** automatically.

### 1b. Render Postgres (hosted database)

1. In Render, create a **PostgreSQL** instance and open **Connections**.
2. Copy the **External Database URL** (use this when your Django app runs on your laptop or on a non-Render host). If the app runs **on Render** in the same region, you can use the **Internal Database URL** instead.
3. Put it in `backend/.env` as `DATABASE_URL=...`. Render URLs usually include `?sslmode=require`; the app also sets `sslmode=require` automatically when the hostname ends with `.render.com`, or you can set `DATABASE_SSLMODE=require`.
4. From `backend/`, run migrations against that database:

```bash
cd backend
export DATABASE_URL='postgresql://...your-render-url...'
python manage.py migrate
python manage.py createsuperuser
# optional demo data (creates local-style demo users — skip on production if you prefer)
# python manage.py seed_demo
```

5. Point `ALLOWED_HOSTS` at your deployed API hostname (comma-separated) and set `CORS_ALLOWED_ORIGINS` to your real frontend origin(s). Set `FRONTEND_URL` for Stripe return URLs.

### 2. Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo   # sports, coach, weekly rule, parent + child, occurrences
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

API base: `http://127.0.0.1:8000/api/v1/`

Stripe (optional for full checkout):

- Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `FRONTEND_URL` in `backend/.env`.
- Point Stripe CLI or dashboard webhooks to `http://127.0.0.1:8000/api/v1/webhooks/stripe/`.

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local   # if present; or set NEXT_PUBLIC_API_URL
npm install
npm run dev
```

Open `http://localhost:3000`.

**Demo logins** (after `seed_demo`):

- Parent: `parent@vaultclub.local` / `parentpass123`
- Coach: `coach@vaultclub.local` / `coachpass123`

## Key flows

- **Parent**: register → add children → browse `/schedule` → book → Stripe Checkout → booking becomes **confirmed** only after verified `checkout.session.completed` webhook.
- **Admin**: Django admin for sports, venues, coaches, schedule rules, occurrences, bookings, payments.
- **Coach**: `GET /api/v1/coach/classes/`, roster and attendance endpoints under `/api/v1/coach/classes/...`.

## Docs

Product and implementation details live in the repo root markdown files (`00_PROJECT_BRIEF.md`, `05_BUILD_PLAN_FOR_CURSOR.md`, etc.).
