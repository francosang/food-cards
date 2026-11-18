import { MOMENT_LABELS, type Card, type Moment, type Nutrition } from "./catalog";
import { CardView } from "./CardView";
import { formatKcal } from "./format";

interface MomentSectionProps {
  moment: Moment;
  goal: Nutrition;
  cards: Card[];
}

export function MomentSection({ moment, goal, cards }: MomentSectionProps) {
  const headingId = `moment-${moment}`;
  return (
    <section aria-labelledby={headingId} className="py-3">
      <header className="flex items-baseline justify-between px-4">
        <h2 id={headingId} className="text-xl font-bold">
          {MOMENT_LABELS[moment]}
        </h2>
        <p className="text-sm text-muted">{formatKcal(goal.kcal)} kcal</p>
      </header>
      <ul className="carousel mt-2 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2">
        {cards.map((card) => (
          <li key={card.id} className="snap-start">
            <CardView card={card} />
          </li>
        ))}
      </ul>
    </section>
  );
}
