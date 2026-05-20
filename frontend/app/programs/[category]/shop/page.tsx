import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgramNav } from "@/components/ProgramNav";
import { ShopProductGrid, type ShopProduct } from "@/components/ShopProductGrid";
import { apiFetch } from "@/lib/api";
import { categoryLabel, getCategoryMeta } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function CategoryShopPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const meta = getCategoryMeta(category);
  if (!meta) notFound();

  const data = await apiFetch<{ results: ShopProduct[] }>(
    `/shop/products/?category=${category}`
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-emerald-300/90">
        {meta.label} · Shop
      </p>
      <h1 className="mt-2 text-3xl font-semibold">
        {categoryLabel(category)} essentials
      </h1>
      <p className="mt-2 max-w-2xl text-slate-400">
        Gear and supplies for any {categoryLabel(category).toLowerCase()} programme
        at the club.
      </p>

      <ProgramNav category={category} active="shop" />

      <div className="mt-10">
        <ShopProductGrid
          products={data.results}
          emptyMessage="No category shop items yet. Add products in Django admin → Shop → Shop products (leave Programme empty)."
        />
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Looking for a specific programme?{" "}
        <Link href={`/programs/${category}`} className="text-emerald-300 hover:underline">
          Browse programmes
        </Link>{" "}
        — each has its own shop too.
      </p>
    </div>
  );
}
