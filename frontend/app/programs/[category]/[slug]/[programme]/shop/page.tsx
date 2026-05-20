import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgramNav } from "@/components/ProgramNav";
import { ShopProductGrid, type ShopProduct } from "@/components/ShopProductGrid";
import { ApiError, apiFetch } from "@/lib/api";
import { categoryLabel, getCategoryMeta, subcategoryLabel } from "@/lib/categories";

export const dynamic = "force-dynamic";

type Program = {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory_slug: string | null;
};

export default async function ProgrammeShopPage({
  params,
}: {
  params: Promise<{ category: string; slug: string; programme: string }>;
}) {
  const { category, slug: subcategory, programme } = await params;
  const meta = getCategoryMeta(category);
  if (!meta) notFound();

  let program: Program;
  try {
    program = await apiFetch<Program>(`/sports/${programme}/`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  if (program.category !== category) notFound();
  if (program.subcategory_slug && program.subcategory_slug !== subcategory) {
    notFound();
  }

  const data = await apiFetch<{ results: ShopProduct[] }>(
    `/shop/products/?category=${category}&programme_slug=${programme}`
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-emerald-300/90">
        {meta.label} · {subcategoryLabel(category, subcategory)} · {program.name} · Shop
      </p>
      <h1 className="mt-2 text-3xl font-semibold">{program.name} shop</h1>
      <p className="mt-2 max-w-2xl text-slate-400">
        Equipment and materials for {program.name.toLowerCase()} only.
      </p>

      <ProgramNav
        category={category}
        subcategorySlug={subcategory}
        programmeSlug={programme}
        active="shop"
      />

      <div className="mt-10">
        <ShopProductGrid
          products={data.results}
          emptyMessage={`No shop items for ${program.name} yet. Add products in admin linked to this programme.`}
        />
      </div>

      <p className="mt-8 text-sm text-slate-500">
        <Link
          href={`/programs/${category}/${subcategory}/shop`}
          className="text-emerald-300 hover:underline"
        >
          {subcategoryLabel(category, subcategory)} shop
        </Link>
        {" · "}
        <Link
          href={`/programs/${category}/shop`}
          className="text-emerald-300 hover:underline"
        >
          {categoryLabel(category)} shop
        </Link>
      </p>
    </div>
  );
}
