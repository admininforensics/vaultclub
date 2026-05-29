"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

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

type Props = {
  start: string;
  end: string;
  sportId?: string;
  category?: string;
  location?: string;
  initialResults: Occurrence[];
};

export function ScheduleOccurrenceList({
  start,
  end,
  sportId,
  category,
  location: locationParam,
  initialResults,
}: Props) {
  const [results, setResults] = useState(initialResults);
  const [locationNote, setLocationNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const qs = new URLSearchParams({ start_date: start, end_date: end });
      if (sportId) qs.set("sport_id", sportId);
      if (category) qs.set("category", category);

      let location = locationParam?.trim() || "";
      if (!location) {
        try {
          const me = await apiFetch<{
            parent_profile?: { location?: string };
          }>("/auth/me/");
          location = me.parent_profile?.location?.trim() || "";
        } catch {
          location = "";
        }
      }

      if (location) {
        qs.set("location", location);
        if (!cancelled) {
          setLocationNote(`Showing sessions near ${location}`);
        }
      } else if (!cancelled) {
        setLocationNote(null);
      }

      try {
        const data = await apiFetch<{ results: Occurrence[] }>(
          `/schedule/?${qs.toString()}`
        );
        if (!cancelled) setResults(data.results);
      } catch {
        if (!cancelled) setResults(initialResults);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [start, end, sportId, category, locationParam]);

  return (
    <>
      {locationNote && (
        <p className="mt-4 text-sm text-emerald-200/90">{locationNote}</p>
      )}
      <div className="mt-10 space-y-4">
        {results.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/15 p-8 text-slate-400">
            No sessions this week yet. Ask a club admin to publish schedule rules
            and run{" "}
            <code className="text-emerald-200">generate_occurrences</code>.
          </p>
        )}
        {results.map((o) => (
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
    </>
  );
}
