import {
  byDateDescending,
  type Day,
  type DayListener,
  type DayRepository,
  type HistoryListener,
} from "./DayRepository";

/**
 * Reference implementation, kept in memory: the one the UI tests inject.
 * Stores and hands out copies, so callers can never alter what is stored.
 */
export function createMemoryDayRepository(): DayRepository {
  const days = new Map<string, Day>();
  const listeners = new Map<string, Set<DayListener>>();
  const historyListeners = new Set<HistoryListener>();

  /** Tells the subscribers of `date` and of the History that the Day of `date` changed. */
  function notify(date: string) {
    for (const listener of listeners.get(date) ?? []) listener(read(date));
    for (const listener of historyListeners) listener(readAll());
  }

  function read(date: string): Day | null {
    const day = days.get(date);
    return day ? structuredClone(day) : null;
  }

  function readAll(): Day[] {
    return [...days.keys()].sort(byDateDescending).map((date) => read(date)!);
  }

  return {
    subscribeDay(date, listener) {
      // Each subscription gets its own entry, even if the same listener subscribes twice.
      const subscription: DayListener = (day) => listener(day);
      if (!listeners.has(date)) listeners.set(date, new Set());
      listeners.get(date)!.add(subscription);
      listener(read(date));
      return () => {
        listeners.get(date)?.delete(subscription);
      };
    },

    subscribeHistory(listener) {
      const subscription: HistoryListener = (days) => listener(days);
      historyListeners.add(subscription);
      listener(readAll());
      return () => {
        historyListeners.delete(subscription);
      };
    },

    async confirmChoice(date, moment, card, goal) {
      const existing = days.get(date);
      days.set(date, {
        date,
        goal: existing?.goal ?? structuredClone(goal),
        choices: { ...existing?.choices, [moment]: structuredClone(card) },
      });
      notify(date);
    },

    async removeChoice(date, moment) {
      const existing = days.get(date);
      if (!existing?.choices[moment]) return;
      const choices = { ...existing.choices };
      delete choices[moment];
      if (Object.keys(choices).length === 0) days.delete(date);
      else days.set(date, { ...existing, choices });
      notify(date);
    },
  };
}
