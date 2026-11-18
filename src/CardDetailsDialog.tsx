import { useEffect, useId, useRef } from "react";
import { KIND_LABELS, MOMENT_LABELS, type Card } from "./catalog";
import { formatGrams, formatKcal } from "./format";
import { ingredientIcon } from "./ingredientIcons";
import { MACRO_STYLES, MACROS } from "./macros";

/** The Macros, then fiber. */
const NUTRIENT_CHIPS = [
  ...MACROS.map((key) => ({ key, label: MACRO_STYLES[key].label, className: MACRO_STYLES[key].chip })),
  { key: "fiber" as const, label: "Fibra", className: "bg-tag text-muted" },
];

interface CardDetailsDialogProps {
  card: Card;
  /** Called once the dialog has closed (button, Escape or a click on the backdrop). */
  onClose: () => void;
}

/**
 * Read-only details of a Card in a native modal `<dialog>`: the browser traps focus,
 * closes it on Escape and puts it in the top layer. It opens on mount; unmount it in `onClose`.
 */
export function CardDetailsDialog({ card, onClose }: CardDetailsDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const ingredientsId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  function close() {
    ref.current?.close();
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // The content fills the dialog, so a click whose target is the dialog itself landed on the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="m-auto max-h-[85dvh] w-[min(28rem,calc(100%-2rem))] overflow-y-auto rounded-2xl bg-surface text-ink shadow-xl backdrop:bg-black/50"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted">
              {MOMENT_LABELS[card.moment]} · {KIND_LABELS[card.kind]}
            </p>
            <h2 id={titleId} className="mt-1 text-xl leading-7 font-bold">
              {card.name}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={close}
            className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-ink"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <ul aria-label="Nutrición" className="mt-4 flex flex-wrap items-center gap-2">
          <li aria-label={`${formatKcal(card.nutrition.kcal)} kcal`} className="mr-1 text-sm text-muted">
            <span className="text-3xl font-bold tracking-tight text-ink">{formatKcal(card.nutrition.kcal)}</span> kcal
          </li>
          {NUTRIENT_CHIPS.map(({ key, label, className }) => {
            const text = `${label} ${formatGrams(card.nutrition[key])} g`;
            return (
              <li key={key} aria-label={text} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
                {text}
              </li>
            );
          })}
        </ul>

        <h3 id={ingredientsId} className="mt-5 text-base font-semibold">
          Ingredientes
        </h3>
        <ul aria-labelledby={ingredientsId} className="mt-2 divide-y divide-line">
          {card.ingredients.map((ingredient) => (
            <li key={ingredient.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="flex items-center gap-2">
                {/* Decorative: the ingredient's name is right next to it. */}
                <img src={ingredientIcon(ingredient)} alt="" className="size-6 shrink-0" />
                <span>{ingredient.name}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="font-semibold">{formatGrams(ingredient.grams)} g</span>
                {ingredient.householdUnit && <span className="block text-xs text-muted">{ingredient.householdUnit}</span>}
              </span>
            </li>
          ))}
        </ul>

        <h3 className="mt-5 text-base font-semibold">
          Preparación
        </h3>
        <p className="mt-2 text-sm leading-6">
          {card.preparation}
        </p>
      </div>
    </dialog>
  );
}
