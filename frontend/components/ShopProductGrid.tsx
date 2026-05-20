import { ShopBuyButton } from "@/components/ShopBuyButton";

export type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  price_cents: number;
  currency: string;
  sku?: string;
};

type Props = {
  products: ShopProduct[];
  emptyMessage: string;
};

export function ShopProductGrid({ products, emptyMessage }: Props) {
  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-white/15 p-8 text-slate-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <article
          key={p.id}
          className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <h3 className="text-lg font-semibold">{p.name}</h3>
          {p.short_description && (
            <p className="mt-2 flex-1 text-sm text-slate-400">{p.short_description}</p>
          )}
          <p className="mt-4 text-sm font-medium text-emerald-200">
            R {(p.price_cents / 100).toFixed(2)}
            {p.sku && (
              <span className="ml-2 text-xs font-normal text-slate-500">
                SKU {p.sku}
              </span>
            )}
          </p>
          <ShopBuyButton productId={p.id} productName={p.name} />
        </article>
      ))}
    </div>
  );
}
