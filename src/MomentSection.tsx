import { useLayoutEffect, useRef } from "react";
import { MOMENT_LABELS, type Card, type Moment, type Nutrition } from "./catalog";
import { CardView, type CardState } from "./CardView";
import { formatKcal } from "./format";

interface MomentSectionProps {
  moment: Moment;
  goal: Nutrition;
  cards: Card[];
  /** Id of the selected (not yet confirmed) Card, if any. */
  selectedId: string | undefined;
  /** Id of the Card of this Moment's Choice, if any. */
  chosenId: string | undefined;
  onCardPress: (cardId: string) => void;
  onTickPress: () => void;
}

export function MomentSection({
  moment,
  goal,
  cards,
  selectedId,
  chosenId,
  onCardPress,
  onTickPress,
}: MomentSectionProps) {
  const headingId = `moment-${moment}`;
  const label = MOMENT_LABELS[moment];
  const confirmed = chosenId !== undefined;
  const carouselRef = useRef<HTMLUListElement>(null);

  // Only on mount (the app mounts Moments once the Day has loaded): start at the chosen Card.
  // Later Choices are made on a Card already in view, so they don't move the carousel.
  useLayoutEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || chosenId === undefined) return;
    const chosen = carousel.querySelector<HTMLElement>(`[data-card-id="${chosenId}"]`);
    const first = carousel.firstElementChild;
    if (chosen && first instanceof HTMLElement) carousel.scrollLeft = chosen.offsetLeft - first.offsetLeft;
  }, []);

  function stateOf(card: Card): CardState {
    if (confirmed) return card.id === chosenId ? "confirmed" : "normal";
    return card.id === selectedId ? "selected" : "normal";
  }

  return (
    <section aria-labelledby={headingId} className="py-3">
      <header className="flex h-9 items-center justify-between gap-3 px-4">
        <h2 id={headingId} className="text-xl font-bold">
          {label}
        </h2>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted">{formatKcal(goal.kcal)} kcal</p>
          {(confirmed || selectedId !== undefined) && (
            <TickButton
              confirmed={confirmed}
              label={confirmed ? `Quitar elección de ${label.toLowerCase()}` : `Confirmar ${label.toLowerCase()}`}
              onClick={onTickPress}
            />
          )}
        </div>
      </header>
      <ul
        ref={carouselRef}
        aria-label={`Tarjetas de ${label.toLowerCase()}`}
        className="carousel mt-2 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 py-1 pb-2"
      >
        {cards.map((card) => (
          <li key={card.id} data-card-id={card.id} className="snap-start">
            <CardView card={card} state={stateOf(card)} inactive={confirmed} onPress={() => onCardPress(card.id)} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Outline = confirm the Selection; filled = confirmed (tap to undo). */
function TickButton({ confirmed, label, onClick }: { confirmed: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`grid size-9 place-items-center rounded-full border-2 transition-colors ${
        confirmed ? "border-accent bg-accent text-on-accent" : "border-ink text-ink"
      }`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth={3}>
        <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
