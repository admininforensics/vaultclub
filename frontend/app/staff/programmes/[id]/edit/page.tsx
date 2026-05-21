"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProgrammeForm, type ProgrammeFormValues } from "@/components/ProgrammeForm";
import { apiFetch } from "@/lib/api";

type Programme = ProgrammeFormValues & { id: string; subcategory_id?: string | null };

export default function EditProgrammePage() {
  const { id } = useParams<{ id: string }>();
  const [initial, setInitial] = useState<Partial<ProgrammeFormValues> | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Programme & { subcategory_id?: string | null }>(
      `/staff/programmes/${id}/`
    )
      .then((p) =>
        setInitial({
          category: p.category,
          subcategory_id: p.subcategory_id ?? "",
          name: p.name,
          slug: p.slug,
          short_description: p.short_description,
          long_description: p.long_description,
          image_url: p.image_url,
          min_age: p.min_age != null ? String(p.min_age) : "",
          max_age: p.max_age != null ? String(p.max_age) : "",
          active: p.active,
          display_order: String(p.display_order),
        })
      )
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-red-200">{error}</div>
    );
  }

  if (!initial) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-slate-400">Loading…</div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Edit programme</h1>
      <ProgrammeForm initial={initial} programmeId={id} />
    </div>
  );
}
