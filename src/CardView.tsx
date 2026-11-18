import { useState } from "react";
import { KIND_LABELS, type Card } from "./catalog";
import { CardDetailsDialog } from "./CardDetailsDialog";
import { formatGrams, formatKcal } from "./format";
import { ingredientIcon, mainIngredients } from "./ingredientIcons";
import { MACRO_STYLES, MACROS } from "./macros";

/** normal, selected (a Selection) or confirmed (the Moment's Choice). */
export type CardState = "normal" | "selected" | "confirmed";

const STATE_CLASSES: Record<CardState, string> = {
  normal: "border-line bg-surface",
  selected: "border-ink bg-surface ring-2 ring-ink",
  confirmed: "border-accent bg-accent-soft ring-2 ring-accent",
};

function showsKind(card: Card): boolean {
  return card.moment === "breakfast" || card.moment === "snack";
}

interface CardViewProps {
  card: Card;
  state: CardState;
  /** Its Moment is confirmed: presses are ignored, but the Card stays focusable. */
  inactive: boolean;
  onPress: () => void;
}

/**
 * A fixed-size Card. The whole Card is a toggle button (stretched over it, so the
 * heading and chips keep their semantics); the reserved bottom slot sits above it.
 */
export function CardView({ card, state, inactive, onPress }: CardViewProps) {
  const headingId = `card-${card.id}`;
  // Viewing details is local to the Card: it never touches the Selection or the Choice.
  const [detailsOpen, setDetailsOpen] = useState(false);
  return (
    <article
      aria-labelledby={headingId}
      className={`relative flex h-64 w-64 shrink-0 snap-start flex-col rounded-2xl border p-4 shadow-sm transition-shadow ${STATE_CLASSES[state]}`}
    >
      <button
        type="button"
        aria-labelledby={headingId}
        aria-pressed={state !== "normal"}
        aria-disabled={inactive || undefined}
        onClick={onPress}
        className="absolute inset-0 rounded-2xl"
      />
      <div className="pointer-events-none relative flex h-6 items-start justify-between">
        {showsKind(card) ? (
          <span className="rounded-full bg-tag px-2 py-0.5 text-xs font-medium text-muted">
            {KIND_LABELS[card.kind]}
          </span>
        ) : (
          <span />
        )}
        {state === "confirmed" && (
          <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-on-accent">Elegida</span>
        )}
      </div>
      <h3 id={headingId} className="pointer-events-none relative mt-1 line-clamp-2 min-h-12 text-base leading-6 font-semibold">
        {card.name}
      </h3>
      <p className="pointer-events-none relative mt-1 text-sm text-muted">
        <span className="text-4xl font-bold tracking-tight text-ink">{formatKcal(card.nutrition.kcal)}</span> kcal
      </p>
      <ul className="pointer-events-none relative mt-2 flex gap-2" aria-label="Macros">
        {MACROS.map((key) => {
          const { short, label, chip } = MACRO_STYLES[key];
          const grams = formatGrams(card.nutrition[key]);
          return (
            <li
              key={key}
              aria-label={`${label} ${grams} g`}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${chip}`}
            >
              {short} {grams} g
            </li>
          );
        })}
      </ul>
      <ul className="pointer-events-none relative mt-2 flex h-6 gap-1.5" aria-label="Ingredientes principales">
        {mainIngredients(card).map((ingredient) => (
          <li key={ingredient.id}>
            <img src={ingredientIcon(ingredient)} alt={ingredient.name} className="size-6" />
          </li>
        ))}
      </ul>
      {/* Reserved slot, stacked above the Card's button, so showing "Ver detalles" never resizes the Card. */}
      <div className="pointer-events-none relative mt-auto flex h-9 items-end">
        {state !== "normal" && (
          <button
            type="button"
            aria-label={`Ver detalles de ${card.name}`}
            onClick={() => setDetailsOpen(true)}
            className="pointer-events-auto h-9 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink"
          >
            Ver detalles
          </button>
        )}
      </div>
      {detailsOpen && <CardDetailsDialog card={card} onClose={() => setDetailsOpen(false)} />}
    </article>
  );
}
