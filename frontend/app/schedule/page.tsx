import Link from "next/link";
import { ScheduleOccurrenceList } from "@/components/ScheduleOccurrenceList";
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
  searchParams: Promise<{
    sport_id?: string;
    category?: string;
    location?: string;
  }>;
}) {
  const { sport_id, category, location } = await searchParams;
  const { start, end } = weekBounds();
  const qs = new URLSearchParams({ start_date: start, end_date: end });
  if (sport_id) qs.set("sport_id", sport_id);
  if (category) qs.set("category", category);
  if (location) qs.set("location", location);
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
          href="/programs"
          className="text-sm font-medium text-emerald-300 hover:text-emerald-200"
        >
          Browse programmes
        </Link>
      </div>

      <ScheduleOccurrenceList
        start={start}
        end={end}
        sportId={sport_id}
        category={category}
        location={location}
        initialResults={data.results}
      />
    </div>
  );
}
