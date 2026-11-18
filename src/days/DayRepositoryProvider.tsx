import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Day, DayRepository } from "./DayRepository";

const DayRepositoryContext = createContext<DayRepository | null>(null);

/** Injects the Day repository. The UI only talks to storage through it (ADR-0001). */
export function DayRepositoryProvider({
  repository,
  children,
}: {
  repository: DayRepository;
  children: ReactNode;
}) {
  return <DayRepositoryContext.Provider value={repository}>{children}</DayRepositoryContext.Provider>;
}

export function useDayRepository(): DayRepository {
  const repository = useContext(DayRepositoryContext);
  if (!repository) throw new Error("useDayRepository needs a <DayRepositoryProvider>");
  return repository;
}

/**
 * The Day of `date`, kept up to date by subscription.
 * `undefined` until the first emission, `null` when the Day does not exist.
 */
export function useDay(date: string): Day | null | undefined {
  const repository = useDayRepository();
  const [state, setState] = useState<{ date: string; day: Day | null } | undefined>();

  useEffect(
    () => repository.subscribeDay(date, (day) => setState({ date, day })),
    [repository, date],
  );

  return state?.date === date ? state.day : undefined;
}

/**
 * Every stored Day, most recent first, kept up to date by subscription.
 * `undefined` until the first emission. Includes today's Day.
 */
export function useAllDays(): Day[] | undefined {
  const repository = useDayRepository();
  const [days, setDays] = useState<Day[] | undefined>();

  useEffect(() => repository.subscribeHistory(setDays), [repository]);

  return days;
}
