import Link from "next/link";
import { apiFetch } from "@/lib/api";

export const dynamic = "force-dynamic";

type Occurrence = {
  id: string;
  sport: { id: string; name: string };
  activity_class: { id: string; title: string };
  starts_at: string;
  ends_at: string;
  venue: string;
  coach: string;
  capacity: number;
  spots_remaining: number;
  price_amount: number;
  currency: string;
  status: string;
};

function weekBounds() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day + 6) % 7;
  const start = new Date(now);
  start.setDate(now.getDate() - diffToMonday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ sport_id?: string }>;
}) {
  const { sport_id } = await searchParams;
  const { start, end } = weekBounds();
  const qs = new URLSearchParams({ start_date: start, end_date: end });
  if (sport_id) qs.set("sport_id", sport_id);
  const data = await apiFetch<{ results: Occurrence[] }>(
    `/schedule/?${qs.toString()}`
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-semibold">Weekly schedule</h1>
          <p className="mt-2 text-slate-400">
            {start} → {end} · times shown in your browser locale.
          </p>
        </div>
        <Link
          href="/sports"
          className="text-sm font-medium text-emerald-300 hover:text-emerald-200"
        >
          Change sport filter
        </Link>
      </div>

      <div className="mt-10 space-y-4">
        {data.results.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/15 p-8 text-slate-400">
            No sessions this week yet. Ask a club admin to publish schedule
            rules and run{" "}
            <code className="text-emerald-200">generate_occurrences</code>.
          </p>
        )}
        {data.results.map((o) => (
          <div
            key={o.id}
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {o.sport.name}
              </p>
              <p className="text-lg font-semibold">{o.activity_class.title}</p>
              <p className="mt-1 text-sm text-slate-400">
                {new Date(o.starts_at).toLocaleString()} –{" "}
                {new Date(o.ends_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {o.venue}
                {o.coach ? ` · ${o.coach}` : ""}
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-emerald-200">
                  {o.spots_remaining}
                </span>{" "}
                spots left ·{" "}
                <span className="font-semibold">
                  {(o.price_amount / 100).toFixed(0)} {o.currency}
                </span>
              </p>
              <Link
                href={`/bookings/new?occurrence=${o.id}`}
                className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
              >
                Book
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
