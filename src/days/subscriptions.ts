import type { Day, DayListener, DayRepository, HistoryListener } from "./DayRepository";

export interface Subscriptions extends Pick<DayRepository, "subscribeDay" | "subscribeHistory"> {
  /** Tells the subscribers of `date` and of the History that the Day of `date` changed. */
  notify(date: string): void;
  /** Tells every subscriber, of any date and of the History, that any Day may have changed. */
  notifyAll(): void;
}

/**
 * The subscribers of a repository whose reads are synchronous underneath. Each emission
 * calls `read` or `readAll`, so every subscriber gets a fresh copy of what is stored.
 */
export function createSubscriptions(read: (date: string) => Day | null, readAll: () => Day[]): Subscriptions {
  const dayListeners = new Map<string, Set<DayListener>>();
  const historyListeners = new Set<HistoryListener>();

  function notifyHistory() {
    for (const listener of historyListeners) listener(readAll());
  }

  return {
    subscribeDay(date, listener) {
      // Each subscription gets its own entry, even if the same listener subscribes twice.
      const subscription: DayListener = (day) => listener(day);
      if (!dayListeners.has(date)) dayListeners.set(date, new Set());
      dayListeners.get(date)!.add(subscription);
      listener(read(date));
      return () => {
        dayListeners.get(date)?.delete(subscription);
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

    notify(date) {
      for (const listener of dayListeners.get(date) ?? []) listener(read(date));
      notifyHistory();
    },

    notifyAll() {
      for (const [date, listeners] of dayListeners) for (const listener of listeners) listener(read(date));
      notifyHistory();
    },
  };
}
