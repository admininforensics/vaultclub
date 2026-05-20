import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgramNav } from "@/components/ProgramNav";
import { apiFetch } from "@/lib/api";
import { getCategoryMeta } from "@/lib/categories";

export const dynamic = "force-dynamic";

type Subcategory = {
  id: string;
  category: string;
  name: string;
  slug: string;
  display_order: number;
};

export default async function ProgramsCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const meta = getCategoryMeta(category);
  if (!meta) notFound();

  const subcategories = await apiFetch<Subcategory[]>(
    `/subcategories/?category=${category}`
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-emerald-300/90">
        {meta.label}
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Choose a discipline</h1>
      <p className="mt-2 max-w-2xl text-slate-400">{meta.tagline}</p>

      <ProgramNav category={category} active="programs" />

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link href="/programs/sports" className="text-slate-400 hover:text-white">
          Sports
        </Link>
        <span className="text-slate-600">·</span>
        <Link href="/programs/music" className="text-slate-400 hover:text-white">
          Music
        </Link>
        <span className="text-slate-600">·</span>
        <Link href="/programs/tutoring" className="text-slate-400 hover:text-white">
          Tutoring
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subcategories.length === 0 && (
          <p className="col-span-full rounded-2xl border border-dashed border-white/15 p-8 text-slate-400">
            No subcategories in this category yet. Run{" "}
            <code className="text-emerald-200">python manage.py seed_subcategories</code>{" "}
            or add them in Django admin under Sports → Programme subcategories.
          </p>
        )}
        {subcategories.map((s) => (
          <Link
            key={s.id}
            href={`/programs/${category}/${s.slug}`}
            className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-6 transition hover:border-emerald-400/40"
          >
            <h2 className="text-xl font-semibold group-hover:text-emerald-200">
              {s.name}
            </h2>
            <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">
              View programmes →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
