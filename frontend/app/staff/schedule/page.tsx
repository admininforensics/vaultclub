"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Rule = {
  id: string;
  activity_class_title: string;
  venue_name: string;
  coach_name: string;
  weekday_display: string;
  start_time: string;
  end_time: string;
  active: boolean;
};

type ActivityClass = { id: string; title: string; sport_name: string };
type Venue = { id: string; name: string };
type Coach = { id: string; name: string; email: string };

const WEEKDAYS = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

export default function StaffSchedulePage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [classes, setClasses] = useState<ActivityClass[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activityClassId, setActivityClassId] = useState("");
  const [venueId, setVenueId] = useState("");
  const [coachId, setCoachId] = useState("");
  const [weekday, setWeekday] = useState("0");
  const [startTime, setStartTime] = useState("15:00");
  const [endTime, setEndTime] = useState("16:00");
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );

  function reload() {
    apiFetch<Rule[]>("/staff/schedule-rules/").then(setRules);
  }

  useEffect(() => {
    reload();
    apiFetch<ActivityClass[]>("/staff/activity-classes/").then(setClasses);
    apiFetch<Venue[]>("/staff/venues/").then(setVenues);
    apiFetch<Coach[]>("/staff/coaches/").then(setCoaches);
  }, []);

  async function onCreateRule(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch("/staff/schedule-rules/", {
        method: "POST",
        body: JSON.stringify({
          activity_class_id: activityClassId,
          venue_id: venueId,
          coach_id: coachId || null,
          weekday: Number(weekday),
          start_time: startTime,
          end_time: endTime,
          recurrence_start_date: startDate,
          active: true,
        }),
      });
      reload();
      setMessage("Schedule rule created.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function onGenerate() {
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch<{ detail: string }>(
        "/staff/generate-occurrences/",
        { method: "POST", body: JSON.stringify({ weeks: 8 }) }
      );
      setMessage(res.detail);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generate failed");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Schedule rules</h1>
        <button
          type="button"
          onClick={onGenerate}
          className="rounded-full border border-amber-400/50 px-4 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-400/10"
        >
          Generate 8 weeks of sessions
        </button>
      </div>
      <p className="mt-2 text-sm text-slate-400">
        Rules define weekly recurrence. Generate sessions so they appear on the
        public calendar.
      </p>

      {message && (
        <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <form
        onSubmit={onCreateRule}
        className="mt-8 grid max-w-2xl gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <label className="text-sm text-slate-400">Activity class</label>
          <select
            required
            value={activityClassId}
            onChange={(e) => setActivityClassId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
          >
            <option value="">Select…</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.sport_name} — {c.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-400">Venue</label>
          <select
            required
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
          >
            <option value="">Select…</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-400">Coach (optional)</label>
          <select
            value={coachId}
            onChange={(e) => setCoachId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
          >
            <option value="">— None —</option>
            {coaches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.email}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-400">Weekday</label>
          <select
            value={weekday}
            onChange={(e) => setWeekday(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
          >
            {WEEKDAYS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-400">Starts</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm text-slate-400">Ends</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm text-slate-400">Recurrence from</label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
          />
        </div>
        <div className="flex items-end sm:col-span-2">
          <button
            type="submit"
            className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Add weekly rule
          </button>
        </div>
      </form>

      <ul className="mt-10 space-y-3">
        {rules.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm"
          >
            <p className="font-medium">{r.activity_class_title}</p>
            <p className="mt-1 text-slate-400">
              {r.weekday_display} {r.start_time.slice(0, 5)}–
              {r.end_time.slice(0, 5)} · {r.venue_name}
              {r.coach_name ? ` · ${r.coach_name}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
