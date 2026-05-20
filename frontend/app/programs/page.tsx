import Link from "next/link";
import { PROGRAM_CATEGORIES } from "@/lib/categories";

export default function ProgramsHubPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Programmes</h1>
      <p className="mt-2 max-w-2xl text-slate-400">
        Sports, music lessons and tutoring — one club, one schedule, one account
        for your children.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {PROGRAM_CATEGORIES.map((c) => (
          <Link
            key={c.key}
            href={c.href}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-emerald-400/40"
          >
            <h2 className="text-xl font-semibold">{c.label}</h2>
            <p className="mt-2 text-sm text-slate-400">{c.tagline}</p>
            <p className="mt-3 text-xs text-emerald-300/90">Includes shop →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
