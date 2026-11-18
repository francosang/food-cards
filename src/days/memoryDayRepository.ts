import { byDateDescending, type Day, type DayRepository } from "./DayRepository";
import { createSubscriptions } from "./subscriptions";

/**
 * Reference implementation, kept in memory: the one the UI tests inject.
 * Stores and hands out copies, so callers can never alter what is stored.
 */
export function createMemoryDayRepository(): DayRepository {
  const days = new Map<string, Day>();
  const { subscribeDay, subscribeHistory, notify } = createSubscriptions(read, readAll);

  function read(date: string): Day | null {
    const day = days.get(date);
    return day ? structuredClone(day) : null;
  }

  function readAll(): Day[] {
    return [...days.keys()].sort(byDateDescending).map((date) => read(date)!);
  }

  return {
    subscribeDay,
    subscribeHistory,

    async confirmChoice(date, moment, choice, goal) {
      const existing = days.get(date);
      days.set(date, {
        date,
        goal: existing?.goal ?? structuredClone(goal),
        choices: { ...existing?.choices, [moment]: structuredClone(choice) },
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
