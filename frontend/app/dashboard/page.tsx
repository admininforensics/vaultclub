"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch, clearTokens, getAccessToken } from "@/lib/api";

type Me = {
  user: { email: string; first_name: string; last_name: string };
  parent_profile?: { whatsapp_number: string };
};

type Child = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  active: boolean;
};

type BookingRow = {
  id: string;
  status: string;
  child: string;
  child_name: string;
  occurrence: {
    id: string;
    starts_at: string;
    activity_class: { title: string };
    sport: { name: string };
  };
};

export default function DashboardPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(!!getAccessToken());
    if (!getAccessToken()) router.replace("/auth");
  }, [router]);

  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<Me>("/auth/me/"),
    enabled: authed,
  });

  const children = useQuery({
    queryKey: ["children"],
    queryFn: () => apiFetch<Child[]>("/children/"),
    enabled: authed && !!me.data,
  });

  const bookings = useQuery({
    queryKey: ["bookings"],
    queryFn: () => apiFetch<{ results: BookingRow[] }>("/bookings/"),
    enabled: authed && !!me.data,
  });

  if (!authed) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-semibold">My kids</h1>
          {me.data && (
            <p className="mt-2 text-slate-400">
              Signed in as {me.data.user.first_name} {me.data.user.last_name} (
              {me.data.user.email})
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            clearTokens();
            router.push("/auth");
          }}
          className="self-start rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-white/35"
        >
          Sign out
        </button>
      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Children</h2>
          <AddChildForm
            onCreated={() => {
              void children.refetch();
            }}
          />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {children.data?.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <p className="text-lg font-semibold">
                {c.first_name} {c.last_name}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                DOB: {c.date_of_birth ?? "—"} · {c.active ? "Active" : "Inactive"}
              </p>
            </div>
          ))}
          {children.data?.length === 0 && (
            <p className="text-sm text-slate-400">
              No children yet — add one with the form.
            </p>
          )}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold">Upcoming bookings</h2>
        <div className="mt-6 space-y-3">
          {bookings.data?.results.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm text-slate-400">{b.child_name}</p>
                <p className="font-medium">
                  {b.occurrence.activity_class.title} · {b.occurrence.sport.name}
                </p>
                <p className="text-sm text-slate-400">
                  {new Date(b.occurrence.starts_at).toLocaleString()}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  b.status === "confirmed"
                    ? "bg-emerald-500/20 text-emerald-200"
                    : b.status === "pending_payment"
                      ? "bg-amber-500/20 text-amber-100"
                      : "bg-white/10 text-slate-200"
                }`}
              >
                {b.status.replace("_", " ")}
              </span>
            </div>
          ))}
          {bookings.data?.results.length === 0 && (
            <p className="text-sm text-slate-400">
              No bookings yet. Browse the{" "}
              <Link href="/schedule" className="text-emerald-300 hover:underline">
                schedule
              </Link>
              .
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function AddChildForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const dob = fd.get("date_of_birth");
      await apiFetch("/children/", {
        method: "POST",
        body: JSON.stringify({
          first_name: fd.get("first_name"),
          last_name: fd.get("last_name"),
          ...(dob ? { date_of_birth: String(dob) } : {}),
        }),
      });
      (e.target as HTMLFormElement).reset();
      setOpen(false);
      onCreated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not add child");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:border-white/35"
      >
        Add child
      </button>
    );
  }

  return (
    <form
      className="w-full max-w-md space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4"
      onSubmit={onSubmit}
    >
      <p className="text-sm font-semibold">New child</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="first_name"
          required
          placeholder="First name"
          className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm"
        />
        <input
          name="last_name"
          required
          placeholder="Last name"
          className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm"
        />
      </div>
      <input
        name="date_of_birth"
        type="date"
        className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm"
      />
      {error && <p className="text-xs text-red-300">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950"
        >
          Save
        </button>
        <button
          type="button"
          className="text-xs text-slate-400"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
