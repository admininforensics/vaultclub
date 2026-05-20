# Vault Club — project todo

Track progress for deployment, local dev, programmes, shop, admin ops, booking flow, and UI polish.

**Priority order:** Admin operations → Booking flow → UI polish  
**Product expansion:** Sports · Music lessons · Tutoring + per-category and per-programme shops

---

## Local development

- [x] Docker Compose Postgres (`docker compose up -d db`)
- [x] Backend venv, migrate, `seed_demo` (optional demo data)
- [x] Frontend `npm run dev` with `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1`
- [x] Fix schedule API 500 (`hold` undefined in `bookings/services.py`)
- [x] Django superuser for admin (see [Admin login](#admin-login) below)
- [ ] Document one-command local bootstrap script (optional)

---

## Render deployment (production API + DB)

- [x] `render.yaml` Blueprint (Postgres + Django web service)
- [x] `build.sh`: install + collectstatic (no migrate during build)
- [x] `preDeployCommand` + start command with `migrate` before Gunicorn
- [x] `dj-database-url` + Render internal/external SSL handling
- [x] Health endpoint `GET /api/v1/health/`
- [x] Root URL `/` redirects to health check
- [x] README deploy + troubleshooting (Blueprint sync, dashboard overrides)
- [x] Blueprint `plan` omitted (choose Free/Starter in dashboard when creating)
- [ ] Set production env on Render: `CORS_ALLOWED_ORIGINS`, `FRONTEND_URL`, Stripe keys
- [ ] Redeploy frontend (Vercel/Render) pointing at production API when ready to share

---

## Program categories (Sports · Music · Tutoring)

- [x] `Sport.category` field + API filter `?category=music|sports|tutoring`
- [x] `ProgramSubcategory` model + API `GET /api/v1/subcategories/?category=…`
- [x] Sport ↔ subcategory link + API filter `?subcategory=rugby|piano|math|…`
- [x] `seed_subcategories` management command (rugby, tennis, cricket, hockey, track · piano–flute · math–science)
- [x] Frontend routes `/programs/sports`, `/programs/music`, `/programs/tutoring` show subcategories
- [x] Subcategory pages `/programs/{category}/{subcategory}` list programmes
- [x] Programme detail `/programs/{category}/{subcategory}/{slug}` (legacy 2-level URLs for Karate etc.)
- [x] `seed_program_categories` management command (demo piano, guitar, maths, English)
- [x] Home + nav updated for three pillars
- [x] `/sports` redirects to `/programs/sports`
- [ ] Admin: rename “Sports” app label to “Programmes” in UI (optional polish)

---

## Shop (category + programme level)

**User request:** Each category has a shop (e.g. general sports gear). Each programme (e.g. Karate) has its own shop for programme-specific items.

- [x] `ShopProduct` model (`category`, optional `programme` FK)
- [x] API `GET /api/v1/shop/products/?category=sports` (category-wide, `programme` empty)
- [x] API `GET /api/v1/shop/products/?category=sports&programme_slug=karate` (programme-only)
- [x] API `POST /api/v1/shop/checkout/` (parent auth, Stripe Checkout when configured)
- [x] Stripe webhook marks shop payments paid (no booking confirm)
- [x] Django admin: Shop → Shop products
- [x] `seed_shop_products` demo items (6 category + 8 programme SKUs)
- [x] Frontend: **Book** / **Shop** tabs via `ProgramNav`
- [x] Category shop: `/programs/{category}/shop`
- [x] Programme shop: `/programs/{category}/{slug}/shop`
- [x] Shop confirmation page: `/shop/confirmation`
- [ ] Shopping cart (multi-item) instead of single-product checkout
- [ ] Order history for parents (“My orders”)
- [ ] Stock / inventory tracking
- [ ] Product images upload (S3 or media) instead of URL only
- [ ] Admin fulfilment workflow (mark order collected/shipped)

---

## 1) Admin operations

- [x] Admin button: **Generate occurrences (8 weeks)** on Class schedule rules list
- [x] Admin templates `DIRS` fixed (button visible)
- [x] Occurrences admin: coach column, `raw_id_fields`
- [x] Bookings admin: sport filter, richer search, date hierarchy
- [x] Payments admin: date hierarchy
- [x] Programmes admin: category column + filter
- [ ] Schedule rules: inlines / filters by sport, venue, coach
- [ ] Occurrence admin actions: bulk cancel, mark completed, link to bookings list
- [ ] Coach roster / attendance shortcuts from occurrence detail (or admin links)
- [ ] Document admin routine in README (weekly rules → generate occurrences → monitor bookings)

---

## 2) Booking flow (next)

- [ ] Audit API: create booking, Stripe checkout session, webhook confirm, cancel
- [ ] Frontend: book CTA from schedule / session detail
- [ ] Frontend: checkout + confirmation pages wired to real API
- [ ] Pending payment hold UX (spots remaining, expiry messaging)
- [ ] Parent “My bookings” statuses (pending / confirmed / cancelled)
- [ ] Stripe test mode locally (`STRIPE_*` + webhook CLI or dashboard)

---

## 3) UI polish (after booking)

- [ ] Lock brand tokens (colors, typography, spacing)
- [ ] Consistent components (buttons, cards, forms, empty states)
- [ ] Home / About / marketing pages aligned with schedule + dashboard + shop
- [ ] Mobile pass on schedule grid, booking flow, and shop grids
- [ ] Accessibility pass (focus states, contrast, form labels)

---

## Admin login (Django — operations, not the public website)

Django admin uses **email** (not a separate username). This is **not** the same as the Next.js app login.

| Field | Value |
|-------|--------|
| URL (local) | http://127.0.0.1:8000/admin/ |
| Email | `admin@vaultclub.local` |
| Password | `admin` |

### Where to click **Generate occurrences (8 weeks)**

1. Log in at http://127.0.0.1:8000/admin/
2. Open **Scheduling** → **Class schedule rules** (list page).
3. Top right: **Generate occurrences (8 weeks)**.
4. Need at least one active schedule rule first.

CLI:

```bash
cd backend && source .venv/bin/activate
python manage.py generate_occurrences --weeks=8
```

### Shop products in admin

**Shop** → **Shop products**

- **Category-wide item:** set Category, leave **Programme** empty (shows on `/programs/sports/shop` etc.).
- **Programme-specific:** set Category + pick Programme (shows on `/programs/sports/karate/shop` etc.).

Seed demo products:

```bash
python manage.py seed_subcategories
python manage.py seed_program_categories
python manage.py seed_shop_products
```

---

## Frontend login (Next.js app — parents & coaches)

| | |
|--|--|
| URL (local) | http://localhost:3000/auth |
| Register | New parent account on the same page |
| Demo parent (after `seed_demo`) | `parent@vaultclub.local` / `parentpass123` |
| Demo coach (after `seed_demo`) | `coach@vaultclub.local` / `coachpass123` |

Day-to-day ops use **Django admin**. Parents use the **frontend** for programmes, shop, and bookings.

---

## Demo logins (after `seed_demo` only)

| Role | Email | Password |
|------|--------|----------|
| Parent | `parent@vaultclub.local` | `parentpass123` |
| Coach | `coach@vaultclub.local` | `coachpass123` |

---

## Quick URL map (local frontend)

| Page | URL |
|------|-----|
| Programmes hub | http://localhost:3000/programs |
| Sports programmes | http://localhost:3000/programs/sports |
| Rugby (subcategory) | http://localhost:3000/programs/sports/rugby |
| Sports shop | http://localhost:3000/programs/sports/shop |
| Karate detail (legacy) | http://localhost:3000/programs/sports/karate |
| Karate shop | http://localhost:3000/programs/sports/karate/shop |
| Piano (subcategory) | http://localhost:3000/programs/music/piano |
| Music / Tutoring | `/programs/music`, `/programs/tutoring` (+ subcategory + `/shop` on each) |
| Schedule | http://localhost:3000/schedule |

---

## Notes

- Celery + Redis: deferred (see `docker-compose.yml` profile `celery` when needed).
- Render Blueprint changes may require **Manual sync** or dashboard edits if start command / health path do not update automatically.
- Shop **Buy now** needs Stripe keys in `backend/.env` and a signed-in **parent** account; otherwise use admin to manage catalogue only.
