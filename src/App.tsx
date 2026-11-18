import { useMemo, useState } from "react";
import { MOMENTS, parseCatalog, type CardsFile, type Moment } from "./catalog";
import { useDay, useDayRepository } from "./days/DayRepositoryProvider";
import { MomentSection } from "./MomentSection";
import { ProgressHeader } from "./ProgressHeader";
import { dayTotals } from "./progress";
import { localDate } from "./today";

export interface AppProps {
  cardsFile: CardsFile;
}

/** Ephemeral UI state: at most one selected Card id per Moment. Never stored. */
type Selections = Partial<Record<Moment, string>>;

export function App({ cardsFile }: AppProps) {
  const catalog = useMemo(() => parseCatalog(cardsFile), [cardsFile]);
  const repository = useDayRepository();
  // "Today", computed once on mount. Ticket 04 replaces this with the injectable clock.
  const [today] = useState(() => localDate());
  const day = useDay(today);
  const [selections, setSelections] = useState<Selections>({});

  const goal = day?.goal ?? catalog.goal;

  function select(moment: Moment, cardId: string | undefined) {
    setSelections((current) => ({ ...current, [moment]: cardId }));
  }

  function pressCard(moment: Moment, cardId: string) {
    if (day?.choices[moment]) return; // A confirmed Moment ignores taps on its Cards.
    select(moment, selections[moment] === cardId ? undefined : cardId);
  }

  function pressTick(moment: Moment) {
    const choice = day?.choices[moment];
    if (choice) {
      select(moment, choice.id);
      void repository.removeChoice(today, moment);
      return;
    }
    const card = catalog.cards[moment].find((c) => c.id === selections[moment]);
    if (!card) return;
    select(moment, undefined);
    void repository.confirmChoice(today, moment, card, catalog.goal);
  }

  return (
    <>
      <ProgressHeader totals={dayTotals(day)} goal={goal.daily} />
      <main className="mx-auto max-w-screen-sm py-2">
        {/* Mounted once the Day has loaded, so each carousel starts at its Choice. */}
        {day !== undefined && MOMENTS.map((moment) => (
          <MomentSection
            key={moment}
            moment={moment}
            goal={goal.moments[moment]}
            cards={catalog.cards[moment]}
            selectedId={selections[moment]}
            chosenId={day?.choices[moment]?.id}
            onCardPress={(cardId) => pressCard(moment, cardId)}
            onTickPress={() => pressTick(moment)}
          />
        ))}
      </main>
    </>
  );
}
