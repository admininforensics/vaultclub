"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch, getAccessToken } from "@/lib/api";

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
};

type Child = { id: string; first_name: string; last_name: string };

export default function NewBookingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const occurrenceId = params.get("occurrence");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) router.replace("/auth");
  }, [router]);

  const occ = useQuery({
    queryKey: ["occurrence", occurrenceId],
    queryFn: () => apiFetch<Occurrence>(`/schedule/${occurrenceId}/`),
    enabled: !!occurrenceId,
  });

  const children = useQuery({
    queryKey: ["children"],
    queryFn: () => apiFetch<Child[]>("/children/"),
    enabled: !!getAccessToken(),
  });

  async function onBook(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!occurrenceId) return;
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await apiFetch<{
        booking_id: string;
        checkout_url: string;
        status: string;
      }>("/bookings/", {
        method: "POST",
        body: JSON.stringify({
          occurrence_id: occurrenceId,
          child_id: fd.get("child_id"),
          payment_method: "stripe_checkout",
        }),
      });
      window.location.href = res.checkout_url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Booking failed");
      setLoading(false);
    }
  }

  if (!occurrenceId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-slate-300">
        Missing <code className="text-emerald-200">occurrence</code> query param.{" "}
        <Link href="/schedule" className="text-emerald-300 underline">
          Open schedule
        </Link>
        .
      </div>
    );
  }

  if (occ.isError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-red-200">
        Could not load this session. It may be full or unpublished.
      </div>
    );
  }

  if (!occ.data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-slate-300">
        Loading session…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Confirm booking</h1>
      <p className="mt-2 text-slate-400">
        You will complete payment on Stripe. Your booking is only confirmed after
        Stripe notifies our server.
      </p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {occ.data.sport.name}
        </p>
        <p className="text-xl font-semibold">{occ.data.activity_class.title}</p>
        <p className="mt-2 text-sm text-slate-300">
          {new Date(occ.data.starts_at).toLocaleString()} · {occ.data.venue}
          {occ.data.coach ? ` · ${occ.data.coach}` : ""}
        </p>
        <p className="mt-4 text-sm text-slate-300">
          {occ.data.spots_remaining} spots left ·{" "}
          <span className="font-semibold text-emerald-200">
            {(occ.data.price_amount / 100).toFixed(0)} {occ.data.currency}
          </span>
        </p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={onBook}>
        <div>
          <label className="text-sm text-slate-400">Child</label>
          <select
            name="child_id"
            required
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm outline-none ring-emerald-400/40 focus:ring-2"
          >
            <option value="">Select…</option>
            {children.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-500">
          By continuing you agree to our cancellation policy (MVP: contact the club
          for changes).
        </p>
        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !children.data?.length}
          className="w-full rounded-full bg-emerald-400 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
        >
          {loading ? "Starting checkout…" : "Continue to Stripe Checkout"}
        </button>
        {!children.data?.length && (
          <p className="text-xs text-amber-200">
            Add a child on your{" "}
            <Link href="/dashboard" className="underline">
              dashboard
            </Link>{" "}
            first.
          </p>
        )}
      </form>
    </div>
  );
}
