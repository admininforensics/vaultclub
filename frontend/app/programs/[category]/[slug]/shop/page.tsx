import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgramNav } from "@/components/ProgramNav";
import { ShopProductGrid, type ShopProduct } from "@/components/ShopProductGrid";
import { ApiError, apiFetch } from "@/lib/api";
import { categoryLabel, getCategoryMeta } from "@/lib/categories";

export const dynamic = "force-dynamic";

type Subcategory = {
  category: string;
  name: string;
  slug: string;
};

export default async function SubcategoryShopPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const meta = getCategoryMeta(category);
  if (!meta) notFound();

  let subcategory: Subcategory;
  try {
    subcategory = await apiFetch<Subcategory>(`/subcategories/${slug}/`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  if (subcategory.category !== category) notFound();

  const data = await apiFetch<{ results: ShopProduct[] }>(
    `/shop/products/?category=${category}&subcategory=${slug}`
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-emerald-300/90">
        {meta.label} · {subcategory.name} · Shop
      </p>
      <h1 className="mt-2 text-3xl font-semibold">{subcategory.name} shop</h1>
      <p className="mt-2 max-w-2xl text-slate-400">
        Gear linked to programmes under {subcategory.name.toLowerCase()}.
      </p>

      <ProgramNav category={category} subcategorySlug={slug} active="shop" />

      <div className="mt-10">
        <ShopProductGrid
          products={data.results}
          emptyMessage={`No shop items for ${subcategory.name} yet. Add products in admin linked to programmes in this subcategory.`}
        />
      </div>

      <p className="mt-8 text-sm text-slate-500">
        General {categoryLabel(category).toLowerCase()} items?{" "}
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
