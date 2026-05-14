export const CATEGORIES = [
  { value: "rodeo", label: "Rodeo", emoji: "🤠", color: "bg-amber-50 text-amber-700" },
  { value: "beef", label: "Beef", emoji: "🥩", color: "bg-rose-50 text-rose-700" },
  { value: "breeding", label: "Breeding", emoji: "🐃", color: "bg-violet-50 text-violet-700" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const getCat = (val: string) => CATEGORIES.find((c) => c.value === val) ?? CATEGORIES[0];
