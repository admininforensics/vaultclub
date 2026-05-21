import Link from "next/link";

export default function StaffHomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Operations dashboard</h1>
      <p className="mt-2 max-w-2xl text-slate-400">
        Manage programmes, weekly schedule rules, and calendar sessions. Only
        accounts with the admin role can use this area.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/staff/programmes"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-amber-500/30"
        >
          <h2 className="text-lg font-semibold text-amber-100">Programmes</h2>
          <p className="mt-2 text-sm text-slate-400">
            Add sports, music, or tutoring offerings shown on the public site.
          </p>
        </Link>
        <Link
          href="/staff/classes"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-amber-500/30"
        >
          <h2 className="text-lg font-semibold text-amber-100">Activity classes</h2>
          <p className="mt-2 text-sm text-slate-400">
            Groups within a programme (e.g. Beginner Karate) with price and capacity.
          </p>
        </Link>
        <Link
          href="/staff/schedule"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-amber-500/30"
        >
          <h2 className="text-lg font-semibold text-amber-100">Schedule rules</h2>
          <p className="mt-2 text-sm text-slate-400">
            Weekly recurrence, then generate calendar sessions for parents to book.
          </p>
        </Link>
        <Link
          href="/staff/venues"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-amber-500/30"
        >
          <h2 className="text-lg font-semibold text-amber-100">Venues</h2>
          <p className="mt-2 text-sm text-slate-400">
            Studios and courts used on schedule rules.
          </p>
        </Link>
      </div>
    </div>
  );
}
