"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch, getAccessToken } from "@/lib/api";

type BookingRow = {
  id: string;
  status: string;
  child_name: string;
  occurrence: {
    starts_at: string;
    activity_class: { title: string };
    sport: { name: string };
    venue: string;
  };
};

export default function BookingConfirmationInner() {
  const params = useSearchParams();
  const bookingId = params.get("booking_id");

  const booking = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => apiFetch<BookingRow>(`/bookings/${bookingId}/`),
    enabled: !!bookingId && !!getAccessToken(),
  });

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Booking status</h1>
      {!bookingId && (
        <p className="mt-4 text-slate-400">
          No booking reference supplied. Return to your{" "}
          <Link href="/dashboard" className="text-emerald-300 underline">
            dashboard
          </Link>
          .
        </p>
      )}
      {bookingId && booking.isLoading && (
        <p className="mt-4 text-slate-400">Loading booking…</p>
      )}
      {booking.isError && (
        <p className="mt-4 text-red-200">
          Could not load booking. If you just paid, wait a few seconds and refresh —
          confirmation arrives via Stripe webhook.
        </p>
      )}
      {booking.data && (
        <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-slate-400">Reference</p>
          <p className="font-mono text-sm text-emerald-200">{booking.data.id}</p>
          <p className="text-lg font-semibold">{booking.data.child_name}</p>
          <p className="text-slate-300">
            {booking.data.occurrence.activity_class.title} ·{" "}
            {booking.data.occurrence.sport.name}
          </p>
          <p className="text-sm text-slate-400">
            {new Date(booking.data.occurrence.starts_at).toLocaleString()} ·{" "}
            {booking.data.occurrence.venue}
          </p>
          <p className="mt-4 text-sm">
            Status:{" "}
            <span className="font-semibold uppercase text-emerald-200">
              {booking.data.status.replace("_", " ")}
            </span>
          </p>
          {booking.data.status === "pending_payment" && (
            <p className="text-sm text-amber-100">
              Payment is still processing. This page will show{" "}
              <span className="font-semibold">confirmed</span> after our server
              receives the Stripe webhook.
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Back to My kids
            </Link>
            <Link
              href="/schedule"
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white"
            >
              Browse more classes
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
