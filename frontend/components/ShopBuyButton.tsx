"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch, getAccessToken } from "@/lib/api";

type Props = {
  productId: string;
  productName: string;
};

export function ShopBuyButton({ productId, productName }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onBuy() {
    if (!getAccessToken()) {
      setError("Sign in to purchase.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ checkout_url: string }>("/shop/checkout/", {
        method: "POST",
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      window.location.href = res.checkout_url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={onBuy}
        disabled={loading}
        className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-60"
      >
        {loading ? "Redirecting…" : "Buy now"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-200">
          {error}{" "}
          {error.includes("Sign in") && (
            <Link href="/auth" className="underline">
              Sign in
            </Link>
          )}
        </p>
      )}
      {!getAccessToken() && !error && (
        <p className="mt-2 text-xs text-slate-500">
          <Link href="/auth" className="text-emerald-300 underline">
            Sign in
          </Link>{" "}
          to buy {productName}.
        </p>
      )}
    </div>
  );
}
