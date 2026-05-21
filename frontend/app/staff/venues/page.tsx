"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Venue = {
  id: string;
  name: string;
  address: string;
  room_or_court: string;
  active: boolean;
};

export default function StaffVenuesPage() {
  const [items, setItems] = useState<Venue[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [room, setRoom] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reload() {
    apiFetch<Venue[]>("/staff/venues/").then(setItems);
  }

  useEffect(() => {
    reload();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch("/staff/venues/", {
        method: "POST",
        body: JSON.stringify({
          name,
          address,
          room_or_court: room,
          active: true,
        }),
      });
      setName("");
      setAddress("");
      setRoom("");
      reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Venues</h1>
      <form
        onSubmit={onCreate}
        className="mt-6 max-w-md space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5"
      >
        <input
          required
          placeholder="Venue name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
        />
        <input
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
        />
        <input
          placeholder="Room / court"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950"
        >
          Add venue
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-red-200">{error}</p>}
      <ul className="mt-8 space-y-2">
        {items.map((v) => (
          <li
            key={v.id}
            className="rounded-xl border border-white/10 px-4 py-3 text-sm"
          >
            <span className="font-medium">{v.name}</span>
            {v.room_or_court && (
              <span className="text-slate-400"> · {v.room_or_court}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
