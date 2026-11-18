import type { Moment } from "../catalog";
import {
  byDateDescending,
  type Day,
  type DayListener,
  type DayRepository,
  type HistoryListener,
} from "./DayRepository";

/** Version of the stored format. Stored Days of any other version read as absent. */
export const SCHEMA_VERSION = 1;

const KEY_PREFIX = "food-cards:days:";

/** Key of the Day of `date`: one entry per Day, like `days/{YYYY-MM-DD}` in Firestore. */
export function dayStorageKey(date: string): string {
  return `${KEY_PREFIX}${date}`;
}

/** What is stored under each key. */
interface StoredDay {
  schemaVersion: typeof SCHEMA_VERSION;
  day: Day;
}

export interface LocalStorageDayRepositoryOptions {
  /** Defaults to the browser's `localStorage`. */
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length">;
  /** Where `storage` events from other tabs arrive. Defaults to `window`. */
  window?: Pick<EventTarget, "addEventListener">;
}

/**
 * Days in `localStorage` (ADR-0001). Synchronous underneath, but it keeps the
 * repository's shape: reads only by subscription, asynchronous writes.
 */
export function createLocalStorageDayRepository(options: LocalStorageDayRepositoryOptions = {}): DayRepository {
  const storage = options.storage ?? window.localStorage;
  const listeners = new Map<string, Set<DayListener>>();
  const historyListeners = new Set<HistoryListener>();

  /** A fresh copy every time, so callers can never alter what is stored. */
  function read(date: string): Day | null {
    return parse(storage.getItem(dayStorageKey(date)), date);
  }

  /** Every readable Day, most recent first. Keys are enumerated, so there is no index to go out of sync. */
  function readAll(): Day[] {
    const dates: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(KEY_PREFIX)) dates.push(key.slice(KEY_PREFIX.length));
    }
    return dates
      .sort(byDateDescending)
      .map(read)
      .filter((day): day is Day => day !== null);
  }

  function write(date: string, day: Day | null) {
    if (day) storage.setItem(dayStorageKey(date), JSON.stringify({ schemaVersion: SCHEMA_VERSION, day } satisfies StoredDay));
    else storage.removeItem(dayStorageKey(date));
  }

  /** Tells the subscribers of `date` and of the History that the Day of `date` changed. */
  function notify(date: string) {
    for (const listener of listeners.get(date) ?? []) listener(read(date));
    for (const listener of historyListeners) listener(readAll());
  }

  // Changes made by other tabs, like Firestore's changes from other devices.
  // The browser never fires this on the tab that made the change.
  (options.window ?? window).addEventListener("storage", (event) => {
    const { key, storageArea } = event as StorageEvent;
    if (storageArea !== storage || !key?.startsWith(KEY_PREFIX)) return;
    notify(key.slice(KEY_PREFIX.length));
  });

  return {
    subscribeDay(date, listener) {
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

    async confirmChoice(date, moment, choice, goal) {
      const existing = read(date);
      write(date, {
        date,
        goal: existing?.goal ?? goal,
        choices: { ...existing?.choices, [moment]: choice },
      });
      notify(date);
    },

    async removeChoice(date, moment: Moment) {
      const existing = read(date);
      if (!existing?.choices[moment]) return;
      const choices = { ...existing.choices };
      delete choices[moment];
      write(date, Object.keys(choices).length === 0 ? null : { ...existing, choices });
      notify(date);
    },
  };
}

/** Corrupt entries, other schema versions or another date's Day read as absent. */
function parse(raw: string | null, date: string): Day | null {
  if (raw === null) return null;
  let stored: unknown;
  try {
    stored = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(stored) || stored.schemaVersion !== SCHEMA_VERSION) return null;
  const day = stored.day;
  if (!isRecord(day) || day.date !== date || !isRecord(day.goal) || !isRecord(day.choices)) return null;
  return day as unknown as Day;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
