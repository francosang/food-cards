const integer = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 });

export function formatKcal(kcal: number): string {
  return integer.format(kcal);
}

export function formatGrams(grams: number): string {
  return integer.format(grams);
}
