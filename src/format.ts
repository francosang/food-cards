// `useGrouping: "always"` so 4-digit numbers group too ("1.900"); es-ES only groups from 5 digits by default.
const integer = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0, useGrouping: "always" });

export function formatKcal(kcal: number): string {
  return integer.format(kcal);
}

export function formatGrams(grams: number): string {
  return integer.format(grams);
}
