import Link from "next/link";
import { apiFetch } from "@/lib/api";

export const dynamic = "force-dynamic";

type Sport = {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  min_age: number | null;
  max_age: number | null;
};

export default async function SportsPage() {
  const sports = await apiFetch<Sport[]>("/sports/");

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Pick their sport</h1>
      <p className="mt-2 max-w-2xl text-slate-400">
        Browse active programmes. Tap a sport to see classes and bookable
        sessions.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sports.map((s) => (
          <Link
            key={s.id}
            href={`/sports/${s.slug}`}
            className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-6 transition hover:border-emerald-400/40"
          >
            <h2 className="text-xl font-semibold group-hover:text-emerald-200">
              {s.name}
            </h2>
            {s.short_description && (
              <p className="mt-2 text-sm text-slate-400">{s.short_description}</p>
            )}
            {(s.min_age != null || s.max_age != null) && (
              <p className="mt-4 text-xs uppercase tracking-wide text-slate-500">
                Ages {s.min_age ?? "—"}–{s.max_age ?? "—"}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
