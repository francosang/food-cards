import type { Card, CardKind } from "./catalog";
import { formatGrams, formatKcal } from "./format";

const MACRO_CHIPS = [
  { key: "protein", short: "P", label: "Proteína", className: "bg-protein-soft text-protein" },
  { key: "carbs", short: "C", label: "Carbohidratos", className: "bg-carbs-soft text-carbs" },
  { key: "fat", short: "G", label: "Grasas", className: "bg-fat-soft text-fat" },
] as const;

const KIND_LABELS: Record<CardKind, string> = { sweet: "Dulce", savory: "Salado" };

function showsKind(card: Card): boolean {
  return card.moment === "breakfast" || card.moment === "snack";
}

export function CardView({ card }: { card: Card }) {
  const headingId = `card-${card.id}`;
  return (
    <article
      aria-labelledby={headingId}
      className="flex h-64 w-64 shrink-0 snap-start flex-col rounded-2xl border border-line bg-surface p-4 shadow-sm"
    >
      <div className="flex h-6 items-start">
        {showsKind(card) && (
          <span className="rounded-full bg-tag px-2 py-0.5 text-xs font-medium text-muted">
            {KIND_LABELS[card.kind]}
          </span>
        )}
      </div>
      <h3 id={headingId} className="mt-1 line-clamp-2 min-h-12 text-base leading-6 font-semibold">
        {card.name}
      </h3>
      <p className="mt-2 text-sm text-muted">
        <span className="text-4xl font-bold tracking-tight text-ink">{formatKcal(card.nutrition.kcal)}</span> kcal
      </p>
      <ul className="mt-3 flex gap-2" aria-label="Macros">
        {MACRO_CHIPS.map(({ key, short, label, className }) => {
          const grams = formatGrams(card.nutrition[key]);
          return (
            <li
              key={key}
              aria-label={`${label} ${grams} g`}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
            >
              {short} {grams} g
            </li>
          );
        })}
      </ul>
      {/* Reserved slot: the "Ver detalles" button will go here without resizing the Card. */}
      <div className="mt-auto h-9" />
    </article>
  );
}
