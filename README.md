```
██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗     ██████╗██╗     ██╗   ██╗██████╗
██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝    ██╔════╝██║     ██║   ██║██╔══██╗
██║   ██║███████║██║   ██║██║     ██║       ██║     ██║     ██║   ██║██████╔╝
╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║       ██║     ██║     ██║   ██║██╔══██╗
 ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║       ╚██████╗███████╗╚██████╔╝██████╔╝
  ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝        ╚═════╝╚══════╝ ╚═════╝ ╚═════╝
```

**Kids programmes** — sports, music lessons, tutoring.

**Stack:** Django + DRF + PostgreSQL · Next.js + TypeScript + Tailwind

**Repo layout:** `backend/` · `frontend/` · `render.yaml` · `docker-compose.yml`

---

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                              ┃
┃   ▓▓▓  LOCAL DEVELOPMENT  ▓▓▓                                                ┃
┃        Run API + site on your machine                                        ┃
┃                                                                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Environment files (create once)

```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Templates are in git; real `.env` files are gitignored.

---

### Step 1 — Database (Docker Postgres)

Run from the **repo root** (`docker-compose.yml` lives here).

```bash
# Start Postgres (Redis is optional — profile `celery`, not needed for MVP)
docker compose up -d db

docker compose logs -f db    # troubleshoot
docker compose stop
docker compose down
docker compose down -v       # ⚠ wipes the database volume
```

Put this in `backend/.env`:

```env
DATABASE_URL=postgresql://vaultclub:vaultclub@127.0.0.1:5432/vaultclub
```

Then migrate and seed **local dev only**:

```bash
cd backend
python manage.py migrate
python manage.py seed_demo
python manage.py seed_subcategories
```

> **No Docker?** Leave `DATABASE_URL` unset — the API falls back to **SQLite**.

---

### Step 2 — Backend API

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo              # local only
python manage.py createsuperuser        # optional
python manage.py runserver 0.0.0.0:8000
```

| What | URL |
|------|-----|
| API | `http://127.0.0.1:8000/api/v1/` |
| Django admin | `http://127.0.0.1:8000/admin/` |

**Demo logins** (after `seed_demo`):

| Role | Email | Password |
|------|-------|----------|
| Parent | `parent@vaultclub.local` | `parentpass123` |
| Coach | `coach@vaultclub.local` | `coachpass123` |

---

### Step 3 — Frontend site

```bash
cd frontend
npm install
npm run dev
```

Open **`http://localhost:3000`**.

---

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                              ┃
┃   ▓▓▓  DEPLOY ON RENDER  ▓▓▓                                                 ┃
┃        Production API + database + website via render.yaml                   ┃
┃                                                                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

Blueprint spec: [`render.yaml`](render.yaml)

Use **Blueprints → New Blueprint Instance** — do not spin up duplicate Postgres/Web services by hand unless you are attaching an existing database (see [Alternate: existing Postgres](#alternate-existing-render-postgres) below).

---

### What the blueprint creates

| Resource | Name | Role |
|----------|------|------|
| PostgreSQL | `vaultclub-db` | `vaultclub` DB/user; `DATABASE_URL` → API |
| Web (API) | `vaultclub-api` | Django, Gunicorn, `rootDir: backend` |
| Web (site) | `vaultclub-web` | Next.js, `rootDir: frontend` |
| Build (API) | `backend/build.sh` | `pip install` → `collectstatic` |
| Pre-deploy | `render.yaml` | `migrate` (internal DB network) |
| Start | `render.yaml` / `start.sh` | `migrate` then Gunicorn |
| Health | `GET /api/v1/health/` | DB + schema ready |
| Frontend build | `frontend/build.sh` | `NEXT_PUBLIC_API_URL` from API **public** URL |

**Not in blueprint yet:** Celery, Redis (post-MVP).

---

### Your URLs after deploy

| Service | Example | Use for |
|---------|---------|---------|
| **vaultclub-web** | `https://vaultclub-web.onrender.com` | Public site (home, programmes, shop) |
| **vaultclub-api** | `https://vaultclub-api.onrender.com` | JSON API + `/admin/` |
| **vaultclub-db** | *(no public URL)* | Postgres only |

`FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` on the API are wired from **vaultclub-web** when you sync the blueprint.

---

### Deploy checklist

1. Push repo to GitHub or GitLab.
2. [Render Dashboard](https://dashboard.render.com/) → **Blueprints** → **New Blueprint Instance** → select repo.
3. Apply spec (`vaultclub-db` + `vaultclub-api` + `vaultclub-web`).
4. When green: open **vaultclub-web** (site) and **vaultclub-api** (API/admin).
5. After `render.yaml` changes: **Blueprints → Sync** so env vars and services stay aligned.
6. On **vaultclub-api** → **Environment**, add Stripe when needed:

   | Variable | Purpose |
   |----------|---------|
   | `STRIPE_SECRET_KEY` | Checkout |
   | `STRIPE_WEBHOOK_SECRET` | Webhooks |
   | `ALLOWED_HOSTS` | Optional custom API domain |

7. Redeploy **vaultclub-web** after API URL changes (`NEXT_PUBLIC_API_URL` is baked at build time).

---

### Verify production

| Check | URL | Expected |
|-------|-----|----------|
| Health | `https://<api-host>/api/v1/health/` | `{"status":"ok"}` (503 = DB/migrations) |
| Sports API | `https://<api-host>/api/v1/sports/` | JSON (may be `[]`) |
| Admin | `https://<api-host>/admin/` | Login page (WhiteNoise static) |
| Stripe webhook | `https://<api-host>/api/v1/webhooks/stripe/` | When payments enabled |

---

### Sync render.yaml to the live service

Render **may not** update start commands when you only push git. If deploy logs show **only**:

```text
==> Running 'gunicorn config.wsgi:application --bind 0.0.0.0:$PORT ...'
```

(no `migrate` first), fix it:

**A — Blueprint sync (preferred)**  
**Blueprints** → your instance → **Sync** / **Manual sync** → redeploy.

**B — Dashboard (fastest)**  
**vaultclub-api** → **Settings**:

| Setting | Value |
|---------|--------|
| **Pre-Deploy Command** | `python manage.py migrate --no-input` |
| **Start Command** | `python manage.py migrate --no-input && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers ${WEB_CONCURRENCY:-2} --timeout 120` |
| **Health Check Path** | `/api/v1/health/` |

**C — Shell (immediate)**  
**vaultclub-api** → **Shell**:

```bash
python manage.py migrate --no-input
```

---

### Troubleshooting deploy

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| Log shows only `gunicorn` at start | Old dashboard command | Sync blueprint or set commands above |
| Build fails on `migrate`, `dpg-*-a` | Build network cannot reach internal DB | Keep `migrate` out of `build.sh`; use preDeploy + start |
| `/api/v1/sports/` **500** | Migrations missing or wrong `DATABASE_URL` | Shell: `migrate`; check `/api/v1/health/` and Logs |
| Health check fails | Wrong path or DB down | Path = `/api/v1/health/` |

---

### Duplicate services (`vaultclub-api` vs `vaultclub-api-4ibp`)

Usually means the stack was created **twice** (Blueprint + manual, or two blueprint runs). The `-4ibp` suffix is Render disambiguating a duplicate name.

| Keep | Often delete |
|------|----------------|
| `vaultclub-api` + `vaultclub-db` (from `render.yaml`) | `vaultclub-api-4ibp` + `vaultclub-db-4ibp` if unused and not linked to your repo |

Before deleting: **Settings** on each service → confirm which is tied to **your** Git repo and live URL.

---

### Production data — do not run seed_demo

From **vaultclub-api** → **Shell** (or locally with External `DATABASE_URL`):

```bash
python manage.py createsuperuser
python manage.py generate_occurrences --weeks=8
```

Use **`/staff`** on the public site or Django admin. **`seed_demo` is local dev only.**

---

### Club managers (`/staff`)

Managers sign in at **`/auth`** (role **admin** or **super_admin**), then **`/staff`** (nav: **Staff**).

```bash
# After the colleague has an account:
python manage.py grant_club_admin colleague@example.com --django-admin
```

**Typical setup:** Programmes → Activity classes → Venues → Schedule rules → **Generate 8 weeks of sessions**.

Staff APIs: `/api/v1/staff/*` (JWT; parents/coaches get 403).

**No “Staff” in the nav / access denied?** Use the public site, not Django `/admin/` only: sign in at **`/auth`** with the **same email** you passed to `grant_club_admin`, then open **`/staff`** (nav link **Staff**). After granting admin, **sign out and sign in again** so your session picks up the new role.

---

### Frontend on Render (manual fallback)

If **vaultclub-web** was not created by blueprint sync:

**New Web Service** → repo → **Root Directory** `frontend` → **Build** `./build.sh` → **Start** `npm start` → env `VAULTCLUB_API_PUBLIC_URL` = `https://vaultclub-api.onrender.com` (public URL, not private IP). Then set API `CORS_ALLOWED_ORIGINS` and `FRONTEND_URL` to the web service URL.

---

### Alternate: existing Render Postgres

<a id="alternate-existing-render-postgres"></a>

1. On **vaultclub-api** → **Environment**, set `DATABASE_URL` to your **Internal Database URL** (same region).
2. Redeploy or Shell: `python manage.py migrate --no-input`.

Do **not** run `seed_demo` against production.

---

### Local machine → Render Postgres only

Use the **External Database URL** in `backend/.env`, then `migrate` / `createsuperuser`. No `seed_demo`.

---

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                              ┃
┃   ▓▓▓  ENVIRONMENT VARIABLES  ▓▓▓                                            ┃
┃                                                                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

| Variable | Local (`backend/.env`) | Render |
|----------|------------------------|--------|
| `DATABASE_URL` | Docker URL or unset (SQLite) | Auto from `vaultclub-db` |
| `SECRET_KEY` | `.env` | Auto-generated |
| `DEBUG` | `True` | `False` |
| `PYTHON_VERSION` | — | `3.12.7` |
| `WEB_CONCURRENCY` | — | `2` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | From `vaultclub-web` URL (blueprint) |
| `FRONTEND_URL` | `http://localhost:3000` | From `vaultclub-web` URL (blueprint) |
| Stripe keys | optional | Dashboard when using checkout |
| `ALLOWED_HOSTS` | `localhost,...` | Optional; `*.onrender.com` auto-added |

Frontend: `NEXT_PUBLIC_API_URL` in `frontend/.env.local` (local) or set at build via `frontend/build.sh` (Render).

---

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                              ┃
┃   ▓▓▓  HOW THE PRODUCT WORKS  ▓▓▓                                            ┃
┃                                                                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

| Actor | Flow |
|-------|------|
| **Parent** | Register → add children → `/schedule` → book → Stripe → **confirmed** only after webhook |
| **Manager** | `/staff` (programmes, schedule); Django admin for advanced edits |
| **Coach** | `/api/v1/coach/classes/`, roster, attendance |

---

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                              ┃
┃   ▓▓▓  ROADMAP (POST-MVP)  ▓▓▓                                               ┃
┃                                                                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

- **Celery + Redis** — payment-hold expiry, notifications (`docker compose --profile celery up -d redis` locally when ready)
- Packages / credits, WhatsApp, richer reporting

---

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                              ┃
┃   ▓▓▓  MORE DOCS  ▓▓▓                                                        ┃
┃                                                                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

| File | Contents |
|------|----------|
| `00_PROJECT_BRIEF.md` | Product vision, roles, MVP scope |
| `05_BUILD_PLAN_FOR_CURSOR.md` | Implementation phases |
| Other `*.md` in repo root | API, domain model, frontend spec |
