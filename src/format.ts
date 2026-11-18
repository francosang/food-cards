// `useGrouping: "always"` so 4-digit numbers group too ("1.900"); es-ES only groups from 5 digits by default.
const integer = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0, useGrouping: "always" });

export function formatKcal(kcal: number): string {
  return integer.format(kcal);
}

export function formatGrams(grams: number): string {
  return integer.format(grams);
}

const longDate = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** "2026-11-17" -> "Martes, 17 de noviembre de 2026". Read as a local date, so it never shifts a day. */
export function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const text = longDate.format(new Date(year, month - 1, day));
  return text.charAt(0).toUpperCase() + text.slice(1);
}
