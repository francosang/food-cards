import { useMemo, useState } from "react";
import { MOMENTS, parseCatalog, type Card, type CardsFile, type Moment } from "./catalog";
import { useToday } from "./clock/ClockProvider";
import { useDay, useDayRepository } from "./days/DayRepositoryProvider";
import { HistoryView } from "./HistoryView";
import { MomentSection } from "./MomentSection";
import { ProgressHeader } from "./ProgressHeader";
import { dayTotals, previewTotals } from "./progress";
import { useRoute } from "./route";

export interface AppProps {
  cardsFile: CardsFile;
}

/** Ephemeral UI state: at most one selected Card id per Moment. Never stored. */
type Selections = Partial<Record<Moment, string>>;

function selectedCards(cards: Record<Moment, Card[]>, selections: Selections): Partial<Record<Moment, Card>> {
  return Object.fromEntries(
    MOMENTS.map((moment) => [moment, cards[moment].find((card) => card.id === selections[moment])]),
  );
}

export function App({ cardsFile }: AppProps) {
  const route = useRoute();
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

  // The Home's state stays here while the Historial is open, so Selections survive a visit.
  if (route === "history") return <HistoryView />;

  return (
    <>
      <ProgressHeader
        totals={dayTotals(day)}
        preview={previewTotals(day, selectedCards(catalog.cards, selections))}
        goal={goal.daily}
      />
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
