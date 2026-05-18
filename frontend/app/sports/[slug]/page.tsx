import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";

export const dynamic = "force-dynamic";

type ActivityClass = {
  id: string;
  title: string;
  description: string;
  min_age: number | null;
  max_age: number | null;
  default_price_cents: number;
  currency: string;
};

type SportDetail = {
  id: string;
  name: string;
  slug: string;
  long_description: string;
  min_age: number | null;
  max_age: number | null;
  activity_classes: ActivityClass[];
};

export default async function SportDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let sport: SportDetail;
  try {
    sport = await apiFetch<SportDetail>(`/sports/${slug}/`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-emerald-300/90">
        Sport
      </p>
      <h1 className="mt-2 text-4xl font-semibold">{sport.name}</h1>
      {sport.long_description && (
        <p className="mt-4 max-w-3xl text-slate-300">{sport.long_description}</p>
      )}
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/schedule"
          className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
        >
          View weekly schedule
        </Link>
        <Link
          href="/sports"
          className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white hover:border-white/35"
        >
          All sports
        </Link>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold">Classes</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {sport.activity_classes.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <h3 className="text-lg font-semibold">{c.title}</h3>
              {c.description && (
                <p className="mt-2 text-sm text-slate-400">{c.description}</p>
              )}
              <p className="mt-4 text-xs uppercase tracking-wide text-slate-500">
                Ages {c.min_age ?? "—"}–{c.max_age ?? "—"} · from{" "}
                {(c.default_price_cents / 100).toFixed(0)} {c.currency}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
