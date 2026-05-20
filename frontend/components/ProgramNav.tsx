import Link from "next/link";
import { categoryLabel } from "@/lib/categories";

type Props = {
  category: string;
  subcategorySlug?: string;
  programmeSlug?: string;
  active: "programs" | "shop";
};

export function ProgramNav({
  category,
  subcategorySlug,
  programmeSlug,
  active,
}: Props) {
  const base = programmeSlug
    ? subcategorySlug
      ? `/programs/${category}/${subcategorySlug}/${programmeSlug}`
      : `/programs/${category}/${programmeSlug}`
    : subcategorySlug
      ? `/programs/${category}/${subcategorySlug}`
      : `/programs/${category}`;
  const shopBase = programmeSlug
    ? subcategorySlug
      ? `/programs/${category}/${subcategorySlug}/${programmeSlug}/shop`
      : `/programs/${category}/${programmeSlug}/shop`
    : subcategorySlug
      ? `/programs/${category}/${subcategorySlug}/shop`
      : `/programs/${category}/shop`;

  return (
    <nav className="mt-6 flex flex-wrap gap-2 text-sm">
      <Link
        href={base}
        className={
          active === "programs"
            ? "rounded-full bg-emerald-400/20 px-4 py-1.5 font-medium text-emerald-200"
            : "rounded-full border border-white/15 px-4 py-1.5 text-slate-300 hover:border-white/30"
        }
      >
        {programmeSlug ? "Classes" : `Book ${categoryLabel(category).toLowerCase()}`}
      </Link>
      <Link
        href={shopBase}
        className={
          active === "shop"
            ? "rounded-full bg-emerald-400/20 px-4 py-1.5 font-medium text-emerald-200"
            : "rounded-full border border-white/15 px-4 py-1.5 text-slate-300 hover:border-white/30"
        }
      >
        Shop
      </Link>
    </nav>
  );
}
