# Vault Club

Monorepo for **Vault Club** — kids programmes across **sports, music lessons, and tutoring**: Django + DRF + PostgreSQL backend, Next.js + TypeScript + Tailwind frontend.

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
cd backend && python manage.py migrate && python manage.py seed_demo && python manage.py seed_subcategories
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

## Deploy on Render (`render.yaml`)

Production API + database are defined in [`render.yaml`](render.yaml). Use a **Blueprint** — do not create separate Postgres/Web Service resources by hand unless you are attaching to an existing database (see below).

### What the blueprint creates

| Resource | Name | Notes |
|----------|------|--------|
| PostgreSQL | `vaultclub-db` | `vaultclub` DB/user; `DATABASE_URL` wired into the API |
| Web service | `vaultclub-api` | `rootDir: backend`, Python 3.12, Gunicorn |
| Build | `backend/build.sh` | `pip install` → `collectstatic` |
| Pre-deploy | `preDeployCommand` in `render.yaml` | `migrate` (private-network DB) |
| Start | `startCommand` in `render.yaml` | `migrate` then Gunicorn (same as `backend/start.sh`) |
| Health check | `GET /api/v1/health/` | DB + schema ready; Render `healthCheckPath` |
| Web service | `vaultclub-web` | Next.js (`frontend/`), public site URL |
| Frontend build | `frontend/build.sh` | Sets `NEXT_PUBLIC_API_URL` from API **public** URL (`RENDER_EXTERNAL_URL`), not private IP |

**Not in the blueprint (yet):** Celery, Redis.

### Duplicate services on Render (`vaultclub-api` vs `vaultclub-api-4ibp`)

That usually means the stack was created **twice** — e.g. one **Blueprint** run plus an older manual Postgres/Web Service, or two blueprint applies. The `-4ibp` suffix is Render disambiguating a second resource with the same base name.

| Keep (typical) | Often safe to remove |
|----------------|----------------------|
| `vaultclub-api` + `vaultclub-db` (names from `render.yaml`) | `vaultclub-api-4ibp` + `vaultclub-db-4ibp` **if** they are not connected to your Git repo and show no recent deploys |

Before deleting anything: open each service → **Settings** → confirm which is linked to **admininforensics/vaultclub** and which has the live URL you use. Delete only the unused pair to avoid double cost and wrong env vars. You do **not** need two APIs and two databases for one app.

### Your URLs after Blueprint sync

| Service | Example URL | What it is |
|---------|-------------|------------|
| **vaultclub-web** | `https://vaultclub-web.onrender.com` | Public website (home, programs, shop UI) |
| **vaultclub-api** | `https://vaultclub-api.onrender.com` | JSON API + Django admin (`/admin/`) |
| **vaultclub-db** | (no public URL) | Postgres only |

`FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` on the API are set from **vaultclub-web**’s URL when you sync the blueprint (see `render.yaml`).

### Deploy steps

1. Push this repo to GitHub or GitLab.
2. [Render Dashboard](https://dashboard.render.com/) → **Blueprints** → **New Blueprint Instance** → select the repo.
3. Confirm the spec from `render.yaml` (`vaultclub-db` + `vaultclub-api`) and apply. Migrations run in **preDeploy** (not during build — Render’s build network cannot resolve internal `dpg-*-a` hostnames).
4. When deploys finish, open **vaultclub-web** for the site URL and **vaultclub-api** for the API/admin.
5. **Blueprints** → your instance → **Sync** (after pushing `render.yaml` changes) so **vaultclub-web** is created and API env vars pick up the web URL.
6. On **vaultclub-api** → **Environment**, set Stripe when needed:

   | Variable | Purpose |
   |----------|---------|
   | `STRIPE_SECRET_KEY` | Payments |
   | `STRIPE_WEBHOOK_SECRET` | Webhooks |
   | `ALLOWED_HOSTS` | Optional custom API domain |

   `CORS_ALLOWED_ORIGINS` and `FRONTEND_URL` are wired from **vaultclub-web** in `render.yaml`; redeploy the API if you add the web service later.

7. Redeploy **vaultclub-web** after API URL changes (frontend bakes `NEXT_PUBLIC_API_URL` at build time).

### Verify

- Health: `https://<vaultclub-api-host>/api/v1/health/` → `{"status":"ok"}` (503 = DB or migrations issue).
- API: `https://<vaultclub-api-host>/api/v1/sports/` → JSON list (may be empty `[]`).
- Admin: `https://<vaultclub-api-host>/admin/` → styled login (static files via WhiteNoise).
- Stripe webhook (when enabled): `https://<vaultclub-api-host>/api/v1/webhooks/stripe/`

### Sync `render.yaml` to the live service (required after git changes)

Render **does not always** update an existing web service when you push `render.yaml`. If deploy logs show:

```text
==> Running 'gunicorn config.wsgi:application --bind 0.0.0.0:$PORT ...'
```

(with **no** `migrate` before Gunicorn), the dashboard is still on an **old** start command. Fix it one of these ways:

**A — Blueprint sync (preferred)**  
**Blueprints** → your instance → **Sync** / **Manual sync** → apply changes → redeploy.

**B — Set commands in the dashboard (fastest)**  
**vaultclub-api** → **Settings**, then:

| Setting | Value |
|---------|--------|
| **Pre-Deploy Command** | `python manage.py migrate --no-input` |
| **Start Command** | `python manage.py migrate --no-input && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers ${WEB_CONCURRENCY:-2} --timeout 120` |
| **Health Check Path** | `/api/v1/health/` |

Save and **Manual Deploy**. The log should show `Running 'python manage.py migrate...` before Gunicorn.

**C — One-off fix in Shell (immediate)**  
**vaultclub-api** → **Shell**:

```bash
python manage.py migrate --no-input
```

Then hit `/api/v1/health/` and `/api/v1/sports/` (expect `[]` if no sports yet).

### Troubleshooting deploy

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| Log shows only `gunicorn ...` at start | Dashboard not synced with `render.yaml` | See **Sync render.yaml** above |
| Build fails on `migrate`, `dpg-*-a` hostname | Build cannot reach internal DB | Keep `migrate` out of `build.sh`; use preDeploy + start command |
| Gunicorn up, `/api/v1/sports/` returns **500** | Migrations not applied or DB URL wrong | Run migrate in Shell; open `/api/v1/health/` for `detail`; check **Logs** for `django.request` traceback |
| Health check never passes | Wrong path or DB not ready | Set health path to `/api/v1/health/` |

### Production data (do not run `seed_demo`)

From **vaultclub-api** → **Shell** (or locally with the DB **External** URL in `DATABASE_URL`):

```bash
python manage.py createsuperuser
python manage.py generate_occurrences --weeks=8
```

Use **Django admin** to create sports, venues, coaches, and schedule rules. `seed_demo` is for local dev only.

### Frontend on Render (manual, if not using Blueprint sync)

**New Web Service** → connect repo → **Root Directory** `frontend` → **Build** `./build.sh` → **Start** `npm start` → add env `VAULTCLUB_API_PUBLIC_URL` = `https://vaultclub-api.onrender.com` (full public URL, not the private IP from Render’s internal host). Then set API `CORS_ALLOWED_ORIGINS` and `FRONTEND_URL` to this service’s `https://…onrender.com` URL.

### Alternate: existing Render Postgres

If you already have a Postgres instance and do not want a new `vaultclub-db`:

1. Deploy or update the blueprint, then on **vaultclub-api** → **Environment** replace `DATABASE_URL` with your **Internal Database URL** (API and DB in the same region).
2. Redeploy (migrations run on pre-deploy) or run `python manage.py migrate` in the Shell.

### Local machine → Render Postgres only

Use the **External Database URL** from the Render DB dashboard in `backend/.env`, then `migrate` / `createsuperuser` as above. Do **not** run `seed_demo` against production.

---

## Environment reference

| Variable | Local | Render (`render.yaml`) |
|----------|-------|-------------------------|
| `DATABASE_URL` | Docker or SQLite (unset) | Auto from `vaultclub-db` |
| `SECRET_KEY` | `.env` | Auto-generated (`generateValue: true`) |
| `DEBUG` | `True` | `False` |
| `PYTHON_VERSION` | — | `3.12.7` |
| `WEB_CONCURRENCY` | — | `2` (Gunicorn workers) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Set in Dashboard after deploy |
| `FRONTEND_URL` | `http://localhost:3000` | Set in Dashboard after deploy |
| Stripe keys | optional | Set when using checkout |
| `ALLOWED_HOSTS` | `localhost,...` | Optional extras; `*.onrender.com` host auto-added |

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
