"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { PROGRAM_CATEGORIES } from "@/lib/categories";

export type ProgrammeFormValues = {
  category: string;
  subcategory_id: string;
  name: string;
  slug: string;
  short_description: string;
  long_description: string;
  image_url: string;
  min_age: string;
  max_age: string;
  active: boolean;
  display_order: string;
};

type Subcategory = { id: string; name: string; slug: string; category: string };

const empty: ProgrammeFormValues = {
  category: "sports",
  subcategory_id: "",
  name: "",
  slug: "",
  short_description: "",
  long_description: "",
  image_url: "",
  min_age: "",
  max_age: "",
  active: true,
  display_order: "0",
};

export function ProgrammeForm({
  initial,
  programmeId,
}: {
  initial?: Partial<ProgrammeFormValues>;
  programmeId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProgrammeFormValues>({
    ...empty,
    ...initial,
  });
  const [subs, setSubs] = useState<Subcategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<Subcategory[]>(
      `/staff/subcategories/?category=${values.category}`
    )
      .then(setSubs)
      .catch(() => setSubs([]));
  }, [values.category]);

  function set(
    key: keyof ProgrammeFormValues,
    v: string | boolean
  ) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const body: Record<string, unknown> = {
      category: values.category,
      name: values.name,
      slug: values.slug || undefined,
      short_description: values.short_description,
      long_description: values.long_description,
      image_url: values.image_url,
      active: values.active,
      display_order: Number(values.display_order) || 0,
      subcategory_id: values.subcategory_id || null,
    };
    if (values.min_age) body.min_age = Number(values.min_age);
    if (values.max_age) body.max_age = Number(values.max_age);

    try {
      if (programmeId) {
        await apiFetch(`/staff/programmes/${programmeId}/`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch("/staff/programmes/", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      router.push("/staff/programmes");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-8 max-w-xl space-y-4" onSubmit={onSubmit}>
      {error && (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div>
        <label className="text-sm text-slate-400">Category</label>
        <select
          value={values.category}
          onChange={(e) => set("category", e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
        >
          {PROGRAM_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-slate-400">Subcategory (optional)</label>
        <select
          value={values.subcategory_id}
          onChange={(e) => set("subcategory_id", e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
        >
          <option value="">— None —</option>
          {subs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-slate-400">Name *</label>
        <input
          required
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
        />
      </div>

      <div>
        <label className="text-sm text-slate-400">
          Slug (leave blank to auto-generate)
        </label>
        <input
          value={values.slug}
          onChange={(e) => set("slug", e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
        />
      </div>

      <div>
        <label className="text-sm text-slate-400">Short description</label>
        <input
          value={values.short_description}
          onChange={(e) => set("short_description", e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
        />
      </div>

      <div>
        <label className="text-sm text-slate-400">Long description</label>
        <textarea
          rows={4}
          value={values.long_description}
          onChange={(e) => set("long_description", e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm text-slate-400">Min age</label>
          <input
            type="number"
            value={values.min_age}
            onChange={(e) => set("min_age", e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm text-slate-400">Max age</label>
          <input
            type="number"
            value={values.max_age}
            onChange={(e) => set("max_age", e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-slate-400">Image URL</label>
        <input
          value={values.image_url}
          onChange={(e) => set("image_url", e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
        />
      </div>

      <div>
        <label className="text-sm text-slate-400">Display order</label>
        <input
          type="number"
          value={values.display_order}
          onChange={(e) => set("display_order", e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.active}
          onChange={(e) => set("active", e.target.checked)}
        />
        Active on public site
      </label>

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-60"
      >
        {loading ? "Saving…" : programmeId ? "Update programme" : "Create programme"}
      </button>
    </form>
  );
}
