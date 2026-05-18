import Link from "next/link";

const sportsPreview = [
  "Artistic gymnastics",
  "Ninja course",
  "Karate",
  "Parkour",
  "Dance",
  "Football skills",
  "Basketball",
  "Swimming",
  "Tennis",
  "Athletics",
  "Multi-sport sampler",
];

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
            Sports for kids who go all-in.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            One club, eleven sports, one weekly rhythm. Register your children,
            browse the calendar, reserve a spot, and pay securely online.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/auth"
              className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
            >
              Register your kid
            </Link>
            <Link
              href="/sports"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-white/40"
            >
              Browse sports
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold">Pick their sport</h2>
        <p className="mt-2 max-w-2xl text-slate-400">
          Multi-sport kids club with age-aware classes and coaches who know how
          to meet children where they are.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {sportsPreview.map((name) => (
            <li
              key={name}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
            >
              {name}
            </li>
          ))}
        </ul>
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
            <p className="mt-2 font-medium">Pick a class</p>
            <p className="mt-2 text-sm text-slate-400">
              Filter by age and sport, then choose a session that fits your week.
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
