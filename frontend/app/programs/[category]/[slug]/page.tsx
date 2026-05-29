import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProgramDetailExtras } from "@/components/ProgramDetailExtras";
import { ProgramNav } from "@/components/ProgramNav";
import { ApiError, apiFetch } from "@/lib/api";
import {
  categoryLabel,
  getCategoryMeta,
} from "@/lib/categories";

export const dynamic = "force-dynamic";

type Program = {
  id: string;
  category: string;
  subcategory_slug: string | null;
  name: string;
  slug: string;
  short_description: string;
  min_age: number | null;
  max_age: number | null;
};

type ActivityClass = {
  id: string;
  title: string;
  description: string;
  min_age: number | null;
  max_age: number | null;
  default_price_cents: number;
  currency: string;
};

type ProgramDetail = Program & {
  long_description: string;
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

type Subcategory = {
  id: string;
  category: string;
  name: string;
  slug: string;
};

async function loadSubcategory(category: string, slug: string) {
  try {
    const sub = await apiFetch<Subcategory>(`/subcategories/${slug}/`);
    if (sub.category !== category) return null;
    return sub;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

async function loadProgram(slug: string) {
  try {
    return await apiFetch<ProgramDetail>(`/sports/${slug}/`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export default async function ProgramsSegmentPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const meta = getCategoryMeta(category);
  if (!meta) notFound();

  const subcategory = await loadSubcategory(category, slug);
  if (subcategory) {
    const programs = await apiFetch<Program[]>(
      `/sports/?category=${category}&subcategory=${slug}`
    );

    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-300/90">
          {meta.label} · {subcategory.name}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{subcategory.name}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Programmes and classes in {subcategory.name.toLowerCase()}.
        </p>

        <ProgramNav category={category} subcategorySlug={slug} active="programs" />

        <div className="mt-6 text-sm">
          <Link
            href={`/programs/${category}`}
            className="text-slate-400 hover:text-white"
          >
            ← All {categoryLabel(category).toLowerCase()}
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-white/15 p-8 text-slate-400">
              No programmes under {subcategory.name} yet. Add a programme in Django
              admin and set its <strong>Subcategory</strong> field.
            </p>
          )}
          {programs.map((p) => (
            <Link
              key={p.id}
              href={`/programs/${category}/${slug}/${p.slug}`}
              className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-6 transition hover:border-emerald-400/40"
            >
              <h2 className="text-xl font-semibold group-hover:text-emerald-200">
                {p.name}
              </h2>
              {p.short_description && (
                <p className="mt-2 text-sm text-slate-400">{p.short_description}</p>
              )}
              {(p.min_age != null || p.max_age != null) && (
                <p className="mt-4 text-xs uppercase tracking-wide text-slate-500">
                  Ages {p.min_age ?? "—"}–{p.max_age ?? "—"}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const program = await loadProgram(slug);
  if (!program || program.category !== category) notFound();

  if (program.subcategory_slug) {
    redirect(
      `/programs/${category}/${program.subcategory_slug}/${program.slug}`
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-emerald-300/90">
        {categoryLabel(category)}
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

      <ProgramNav category={category} programmeSlug={slug} active="programs" />

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href={`/schedule?sport_id=${program.id}`}
          className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
        >
          View weekly schedule
        </Link>
        <Link
          href={`/programs/${category}`}
          className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white hover:border-white/35"
        >
          All {meta.label.toLowerCase()}
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
