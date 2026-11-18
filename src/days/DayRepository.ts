import type { Card, Goal, Moment } from "../catalog";

/**
 * A Day: the Choices of one local date (`YYYY-MM-DD`) and the Goal it had.
 * One document per date, like `days/{YYYY-MM-DD}` in Firestore. A Day without
 * Choices does not exist.
 */
export interface Day {
  date: string;
  /** Snapshot of the Goal (daily and per Moment) when the Day was created. */
  goal: Goal;
  /** At most one Choice per Moment: a frozen copy of the Card as it was when confirmed (ADR-0002). */
  choices: Partial<Record<Moment, Card>>;
}

/** Receives the Day, or `null` when it does not exist. */
export type DayListener = (day: Day | null) => void;

/** Receives every Day, most recent date first. */
export type HistoryListener = (days: Day[]) => void;

export type Unsubscribe = () => void;

/**
 * Days storage with the shape of Firestore (ADR-0001): reads are subscriptions
 * that emit the current state and then every change; writes are asynchronous.
 * Every implementation passes `describeDayRepositoryContract` unchanged.
 */
export interface DayRepository {
  /** Emits the Day (or `null`) on subscribe and after every change to it. */
  subscribeDay(date: string, listener: DayListener): Unsubscribe;
  /**
   * Emits every Day, sorted by date descending, on subscribe and after every change to any
   * of them. It includes today's Day: leaving it out of the Historial is up to the UI.
   */
  subscribeHistory(listener: HistoryListener): Unsubscribe;
  /** Creates the Day if needed (storing `goal`) and sets the Choice of `moment`. */
  confirmChoice(date: string, moment: Moment, card: Card, goal: Goal): Promise<void>;
  /** Removes the Choice of `moment`; deletes the Day when it was the last one. */
  removeChoice(date: string, moment: Moment): Promise<void>;
}

/** Orders `YYYY-MM-DD` dates from the most recent to the oldest. */
export function byDateDescending(a: string, b: string): number {
  return a < b ? 1 : a > b ? -1 : 0;
}
