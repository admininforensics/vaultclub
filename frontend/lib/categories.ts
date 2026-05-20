export const PROGRAM_CATEGORIES = [
  {
    key: "sports",
    label: "Sports",
    tagline: "Movement, teamwork and confidence on the court or field.",
    href: "/programs/sports",
    accent: "emerald",
  },
  {
    key: "music",
    label: "Music lessons",
    tagline: "Piano, guitar, singing and more — learn at their own pace.",
    href: "/programs/music",
    accent: "violet",
  },
  {
    key: "tutoring",
    label: "Tutoring",
    tagline: "Math, English, Afrikaans and science support in small groups.",
    href: "/programs/tutoring",
    accent: "amber",
  },
] as const;

export type ProgramCategoryKey = (typeof PROGRAM_CATEGORIES)[number]["key"];

export const PROGRAM_SUBCATEGORIES: Record<
  ProgramCategoryKey,
  readonly { slug: string; name: string }[]
> = {
  sports: [
    { slug: "rugby", name: "Rugby" },
    { slug: "tennis", name: "Tennis" },
    { slug: "cricket", name: "Cricket" },
    { slug: "hockey", name: "Hockey" },
    { slug: "track", name: "Track" },
  ],
  music: [
    { slug: "piano", name: "Piano" },
    { slug: "guitar", name: "Guitar" },
    { slug: "singing", name: "Singing" },
    { slug: "drums", name: "Drums" },
    { slug: "bass", name: "Bass" },
    { slug: "flute", name: "Flute" },
  ],
  tutoring: [
    { slug: "math", name: "Math" },
    { slug: "english", name: "English" },
    { slug: "afrikaans", name: "Afrikaans" },
    { slug: "science", name: "Science" },
  ],
};

export function getCategoryMeta(key: string) {
  return PROGRAM_CATEGORIES.find((c) => c.key === key);
}

export function getSubcategoryMeta(category: string, slug: string) {
  const subs = PROGRAM_SUBCATEGORIES[category as ProgramCategoryKey];
  return subs?.find((s) => s.slug === slug);
}

export function categoryLabel(key: string) {
  return getCategoryMeta(key)?.label ?? key;
}

export function subcategoryLabel(category: string, slug: string) {
  return getSubcategoryMeta(category, slug)?.name ?? slug;
}
