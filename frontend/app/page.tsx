import Link from "next/link";
import { PROGRAM_CATEGORIES } from "@/lib/categories";

const sportsPreview = ["Rugby", "Tennis", "Cricket", "Hockey", "Track"];

const musicPreview = ["Piano", "Guitar", "Singing", "Drums", "Bass", "Flute"];

const tutoringPreview = ["Math", "English", "Afrikaans", "Science"];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300/90">
            Vault Club
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            Sports, music and tutoring — one club for your kids.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Register your children, browse programmes by category, reserve a spot
            on the weekly calendar, and pay securely online.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/auth"
              className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
            >
              Register your kid
            </Link>
            <Link
              href="/programs"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-white/40"
            >
              Browse programmes
            </Link>
            <Link
              href="/schedule"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-white/40"
            >
              View calendar
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold">Three ways to learn</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {PROGRAM_CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={c.href}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-emerald-400/40"
            >
              <h3 className="text-lg font-semibold">{c.label}</h3>
              <p className="mt-2 text-sm text-slate-400">{c.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              Sports
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {sportsPreview.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-violet-300">
              Music
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {musicPreview.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-300">
              Tutoring
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {tutoringPreview.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold">Register</h3>
            <p className="mt-2 text-sm text-slate-400">
              Parent accounts, child profiles, and emergency details in one
              place.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Schedules</h3>
            <p className="mt-2 text-sm text-slate-400">
              Calendar-first view with spots remaining and clear pricing.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Stay in the loop</h3>
            <p className="mt-2 text-sm text-slate-400">
              WhatsApp-friendly contact for cancellations, photos, and club news.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          <li className="rounded-2xl border border-white/10 p-6">
            <span className="text-xs font-semibold uppercase text-emerald-300">
              Step 1
            </span>
            <p className="mt-2 font-medium">Pick a programme</p>
            <p className="mt-2 text-sm text-slate-400">
              Sports, music or tutoring — filter by age and book the right session.
            </p>
          </li>
          <li className="rounded-2xl border border-white/10 p-6">
            <span className="text-xs font-semibold uppercase text-emerald-300">
              Step 2
            </span>
            <p className="mt-2 font-medium">Pay your way</p>
            <p className="mt-2 text-sm text-slate-400">
              Drop-in sessions with Stripe Checkout. Packages can layer on later.
            </p>
          </li>
          <li className="rounded-2xl border border-white/10 p-6">
            <span className="text-xs font-semibold uppercase text-emerald-300">
              Step 3
            </span>
            <p className="mt-2 font-medium">Show up ready</p>
            <p className="mt-2 text-sm text-slate-400">
              Confirmed bookings after payment webhooks — no guesswork at the desk.
            </p>
          </li>
        </ol>
      </section>
    </div>
  );
}
