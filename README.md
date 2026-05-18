# Vault Club

Monorepo for the **Vault Club** kids sports booking product: Django + DRF + PostgreSQL backend, Next.js + TypeScript + Tailwind frontend.

## Quick start (local)

### 1. Database with Docker (local Postgres)

From the **repo root** (where `docker-compose.yml` lives):

```bash
# Postgres only (MVP — Redis is optional, profile `celery`, not needed yet)
docker compose up -d db

docker compose logs -f db
docker compose stop
docker compose down
docker compose down -v   # wipes DB volume
```

Connection string for `backend/.env`:

```env
DATABASE_URL=postgresql://vaultclub:vaultclub@127.0.0.1:5432/vaultclub
```

```bash
cp backend/.env.example backend/.env
cd backend && python manage.py migrate && python manage.py seed_demo
```

Without Docker and without `DATABASE_URL`, the API uses **SQLite** automatically.

### 2. Backend (local)

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo          # local dev only — demo parent/coach + schedule
python manage.py createsuperuser    # optional extra admin user
python manage.py runserver 0.0.0.0:8000
```

API base: `http://127.0.0.1:8000/api/v1/` · Django admin: `http://127.0.0.1:8000/admin/`

**Demo logins** (after `seed_demo` only):

- Parent: `parent@vaultclub.local` / `parentpass123`
- Coach: `coach@vaultclub.local` / `coachpass123`

### 3. Frontend (local)

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

---

## Deploy API on Render (Blueprint)

The repo includes [`render.yaml`](render.yaml) for a **Blueprint** deploy: **PostgreSQL + Django web service (Gunicorn)**. Celery/Redis are **not** part of the blueprint yet (MVP first).

### Steps

1. Push this repo to GitHub/GitLab.
2. In [Render](https://dashboard.render.com/) → **Blueprints** → **New Blueprint Instance** → connect the repo.
3. Render creates `vaultclub-db` and `vaultclub-api` from `render.yaml`.
4. After the first deploy, open **vaultclub-api** → **Environment** and set:
   - `CORS_ALLOWED_ORIGINS` — your frontend origin(s), e.g. `https://your-app.vercel.app`
   - `FRONTEND_URL` — same base URL (Stripe redirects)
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — when testing payments
   - `ALLOWED_HOSTS` — only if you use a custom domain (Render’s `*.onrender.com` host is added automatically)
5. **Production data (do not run `seed_demo`):**
   ```bash
   # One-off shell on Render, or locally with production DATABASE_URL:
   python manage.py createsuperuser
   ```
   Then use **Django admin** (`https://<your-api>.onrender.com/admin/`) to add sports, venues, coaches, schedule rules, and run **Generate occurrences** via admin or:
   ```bash
   python manage.py generate_occurrences --weeks=8
   ```

### Connect an existing Render Postgres

If you already created a database manually:

1. **vaultclub-api** → Environment → set `DATABASE_URL` to the **Internal Database URL** (same region) or External URL.
2. Redeploy, or run `python manage.py migrate` from the Render shell.

### Local API against Render Postgres

Use the **External Database URL** in `backend/.env`, then:

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

Do **not** run `seed_demo` against production.

---

## Environment reference

| Variable | Local | Render |
|----------|-------|--------|
| `DATABASE_URL` | Docker or SQLite (unset) | From blueprint DB or manual |
| `SECRET_KEY` | `.env` | Auto-generated in blueprint |
| `DEBUG` | `True` | `False` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Your deployed frontend |
| `FRONTEND_URL` | `http://localhost:3000` | Your deployed frontend |
| Stripe keys | optional | required for checkout |

---

## Roadmap (post-MVP)

- **Celery + Redis** — expire unpaid booking holds, async notifications (`docker compose --profile celery up -d redis` locally when implemented).
- REST admin UI, packages/credits, WhatsApp integration.

## Key flows

- **Parent**: register → add children → browse `/schedule` → book → Stripe Checkout → booking **confirmed** only after Stripe webhook.
- **Admin**: Django admin for sports, venues, coaches, schedule rules, occurrences, bookings, payments.
- **Coach**: `GET /api/v1/coach/classes/`, roster and attendance under `/api/v1/coach/classes/...`.

## Docs

Product specs: `00_PROJECT_BRIEF.md`, `05_BUILD_PLAN_FOR_CURSOR.md`, and related markdown in the repo root.
