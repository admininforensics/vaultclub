import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgramDetailExtras } from "@/components/ProgramDetailExtras";
import { ProgramNav } from "@/components/ProgramNav";
import { ApiError, apiFetch } from "@/lib/api";
import {
  categoryLabel,
  getCategoryMeta,
  subcategoryLabel,
} from "@/lib/categories";

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

type ProgramDetail = {
  id: string;
  category: string;
  subcategory_slug: string | null;
  name: string;
  slug: string;
  long_description: string;
  min_age: number | null;
  max_age: number | null;
  activity_classes: ActivityClass[];
  coaches: {
    id: string;
    name: string;
    bio: string;
    photo_url: string;
  }[];
  venues: {
    id: string;
    name: string;
    address: string;
    city: string;
    image_url: string;
    maps_url: string;
    room_or_court: string;
  }[];
};

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string; programme: string }>;
}) {
  const { category, slug: subcategory, programme } = await params;
  const meta = getCategoryMeta(category);
  if (!meta) notFound();

  let program: ProgramDetail;
  try {
    program = await apiFetch<ProgramDetail>(`/sports/${programme}/`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  if (program.category !== category) notFound();
  if (program.subcategory_slug && program.subcategory_slug !== subcategory) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-emerald-300/90">
        {categoryLabel(category)} · {subcategoryLabel(category, subcategory)}
      </p>
      <h1 className="mt-2 text-4xl font-semibold">{program.name}</h1>
      {program.long_description && (
        <p className="mt-4 max-w-3xl text-slate-300">{program.long_description}</p>
      )}

      <ProgramDetailExtras
        sportId={program.id}
        coaches={program.coaches ?? []}
        venues={program.venues ?? []}
      />

      <ProgramNav
        category={category}
        subcategorySlug={subcategory}
        programmeSlug={programme}
        active="programs"
      />

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href={`/schedule?sport_id=${program.id}`}
          className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
        >
          View weekly schedule
        </Link>
        <Link
          href={`/programs/${category}/${subcategory}`}
          className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white hover:border-white/35"
        >
          All {subcategoryLabel(category, subcategory).toLowerCase()}
        </Link>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold">Classes</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {program.activity_classes.map((c) => (
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
