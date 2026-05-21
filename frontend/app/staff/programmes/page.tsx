"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { categoryLabel } from "@/lib/categories";

type Programme = {
  id: string;
  category: string;
  name: string;
  slug: string;
  active: boolean;
  display_order: number;
};

export default function StaffProgrammesPage() {
  const [items, setItems] = useState<Programme[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Programme[]>("/staff/programmes/")
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Programmes</h1>
        <Link
          href="/staff/programmes/new"
          className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300"
        >
          Add programme
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">{categoryLabel(p.category)}</td>
                <td className="px-4 py-3 text-slate-400">{p.slug}</td>
                <td className="px-4 py-3">{p.active ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/staff/programmes/${p.id}/edit`}
                    className="text-amber-300 hover:text-amber-200"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && !error && (
          <p className="px-4 py-8 text-slate-400">No programmes yet.</p>
        )}
      </div>
    </div>
  );
}
