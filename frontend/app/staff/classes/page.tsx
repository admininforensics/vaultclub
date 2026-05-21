"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type ActivityClass = {
  id: string;
  sport_id: string;
  sport_name: string;
  title: string;
  default_capacity: number;
  default_price_cents: number;
  currency: string;
  active: boolean;
};

type Programme = { id: string; name: string };

export default function StaffClassesPage() {
  const [items, setItems] = useState<ActivityClass[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [sportId, setSportId] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("15000");
  const [capacity, setCapacity] = useState("12");

  function reload() {
    apiFetch<ActivityClass[]>("/staff/activity-classes/")
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }

  useEffect(() => {
    reload();
    apiFetch<Programme[]>("/staff/programmes/").then(setProgrammes);
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch("/staff/activity-classes/", {
        method: "POST",
        body: JSON.stringify({
          sport_id: sportId,
          title,
          default_price_cents: Number(price),
          default_capacity: Number(capacity),
          currency: "ZAR",
          active: true,
        }),
      });
      setShowForm(false);
      setTitle("");
      reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Activity classes</h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950"
        >
          {showForm ? "Cancel" : "Add class"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={onCreate}
          className="mt-6 max-w-md space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <div>
            <label className="text-sm text-slate-400">Programme</label>
            <select
              required
              value={sportId}
              onChange={(e) => setSportId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
            >
              <option value="">Select…</option>
              {programmes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-400">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-400">Price (cents)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">Capacity</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
              />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Create class
          </button>
        </form>
      )}

      {error && (
        <p className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <ul className="mt-8 space-y-3">
        {items.map((c) => (
          <li
            key={c.id}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
          >
            <p className="text-xs text-slate-500">{c.sport_name}</p>
            <p className="font-medium">{c.title}</p>
            <p className="mt-1 text-sm text-slate-400">
              {(c.default_price_cents / 100).toFixed(0)} {c.currency} · cap{" "}
              {c.default_capacity}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-slate-500">
        <Link href="/staff/programmes" className="text-amber-300 hover:underline">
          Programmes
        </Link>{" "}
        must exist before adding classes.
      </p>
    </div>
  );
}
