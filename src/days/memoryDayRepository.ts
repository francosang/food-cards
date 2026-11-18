import type { Day, DayListener, DayRepository } from "./DayRepository";

/**
 * Reference implementation, kept in memory (tests and until ticket 03).
 * Stores and hands out copies, so callers can never alter what is stored.
 */
export function createMemoryDayRepository(): DayRepository {
  const days = new Map<string, Day>();
  const listeners = new Map<string, Set<DayListener>>();

  function notify(date: string) {
    for (const listener of listeners.get(date) ?? []) listener(read(date));
  }

  function read(date: string): Day | null {
    const day = days.get(date);
    return day ? structuredClone(day) : null;
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
