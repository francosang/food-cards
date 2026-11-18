import { useMemo, useState } from "react";
import { MOMENTS, parseCatalog, type CardsFile, type Moment } from "./catalog";
import { useToday } from "./clock/ClockProvider";
import { useDay, useDayRepository } from "./days/DayRepositoryProvider";
import { MomentSection } from "./MomentSection";
import { ProgressHeader } from "./ProgressHeader";
import { dayTotals } from "./progress";

export interface AppProps {
  cardsFile: CardsFile;
}

/** Ephemeral UI state: at most one selected Card id per Moment. Never stored. */
type Selections = Partial<Record<Moment, string>>;

export function App({ cardsFile }: AppProps) {
  const catalog = useMemo(() => parseCatalog(cardsFile), [cardsFile]);
  const repository = useDayRepository();
  const { today, refresh: refreshToday } = useToday();
  const day = useDay(today);
  // Selections belong to the date they were made on, so a new Day starts without any.
  const [selectionState, setSelectionState] = useState<{ date: string; selections: Selections }>({
    date: today,
    selections: {},
  });
  const selections: Selections = selectionState.date === today ? selectionState.selections : {};

  const goal = day?.goal ?? catalog.goal;

  function select(moment: Moment, cardId: string | undefined, date = today) {
    setSelectionState((current) => ({
      date,
      selections: { ...(current.date === date ? current.selections : {}), [moment]: cardId },
    }));
  }

  function pressCard(moment: Moment, cardId: string) {
    if (day?.choices[moment]) return; // A confirmed Moment ignores taps on its Cards.
    select(moment, selections[moment] === cardId ? undefined : cardId);
  }

  function pressTick(moment: Moment) {
    // Re-read the clock before writing: past midnight, the write goes to the new Day (ADR-0003).
    const date = refreshToday();
    const choice = day?.choices[moment];
    if (choice) {
      if (date !== today) return; // That Choice belongs to the previous Day, which stays intact.
      select(moment, choice.id);
      void repository.removeChoice(date, moment);
      return;
    }
    const card = catalog.cards[moment].find((c) => c.id === selections[moment]);
    if (!card) return;
    select(moment, undefined, date);
    void repository.confirmChoice(date, moment, card, catalog.goal);
  }

  return (
    <>
      <ProgressHeader totals={dayTotals(day)} goal={goal.daily} />
      <main className="mx-auto max-w-screen-sm py-2">
        {MOMENTS.map((moment) => (
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
