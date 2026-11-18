import { beforeEach } from "vitest";
import type { Card, Goal } from "../catalog";
import type { Day } from "./DayRepository";
import { describeDayRepositoryContract, describeDurableDayRepositoryContract } from "./dayRepositoryContract";
import { createLocalStorageDayRepository, dayStorageKey, SCHEMA_VERSION } from "./localStorageDayRepository";

beforeEach(() => {
  localStorage.clear();
});

// The browser's own localStorage and window, as in production.
describeDayRepositoryContract("localStorage", () => createLocalStorageDayRepository());

// Several tabs of one fake browser: each instance is a tab with its own window.
describeDurableDayRepositoryContract("localStorage", {
  createStore: () => createFakeBrowser(),
  open: (browser) => {
    const tab = browser.openTab();
    return createLocalStorageDayRepository({ storage: tab.localStorage, window: tab.window });
  },
  corruptDay: (browser, date) => {
    browser.entries.set(dayStorageKey(date), '{"schemaVersion":1,"day":');
  },
  storeUnknownSchemaDay: (browser, date) => {
    // A Day valid in every other way: only the version says it can't be read.
    const day: Day = { date, goal: GOAL, choices: { breakfast: PORRIDGE } };
    browser.entries.set(dayStorageKey(date), JSON.stringify({ schemaVersion: SCHEMA_VERSION + 1, day }));
  },
});

const GOAL: Goal = {
  daily: { kcal: 1900, protein: 180, carbs: 175, fat: 56, fiberMin: 30 },
  moments: {
    breakfast: { kcal: 400, protein: 35, carbs: 45, fat: 9 },
    lunch: { kcal: 600, protein: 55, carbs: 55, fat: 18 },
    snack: { kcal: 300, protein: 35, carbs: 25, fat: 7 },
    dinner: { kcal: 600, protein: 55, carbs: 50, fat: 22 },
  },
};

const PORRIDGE: Card = {
  id: "des-01",
  moment: "breakfast",
  kind: "sweet",
  name: "Porridge",
  ingredients: [{ id: "avena", name: "Copos de avena", grams: 40, category: "cereal" }],
  preparation: "Mezclar y calentar.",
  nutrition: { kcal: 400, protein: 35, carbs: 45, fat: 9, fiber: 5 },
};

interface FakeTab {
  window: EventTarget;
  localStorage: Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length">;
}

/**
 * One origin's localStorage, shared by every tab opened on it. Like a browser, a
 * change fires a `storage` event, in a later task, on every other tab's window
 * (never on the tab that made it), and only when the value actually changed.
 */
function createFakeBrowser() {
  const entries = new Map<string, string>();
  const tabs: FakeTab[] = [];

  function change(from: FakeTab, key: string, newValue: string | null) {
    const oldValue = entries.get(key) ?? null;
    if (oldValue === newValue) return;
    if (newValue === null) entries.delete(key);
    else entries.set(key, newValue);
    for (const tab of tabs) {
      if (tab === from) continue;
      setTimeout(() => {
        // jsdom's StorageEvent only accepts its own Storage as storageArea.
        const event = Object.assign(new Event("storage"), {
          key,
          oldValue,
          newValue,
          url: "https://francosang.github.io/food-cards/",
          storageArea: tab.localStorage,
        });
        tab.window.dispatchEvent(event);
      }, 0);
    }
  }

  function openTab(): FakeTab {
    const tab: FakeTab = {
      window: new EventTarget(),
      localStorage: {
        getItem: (key) => entries.get(key) ?? null,
        setItem: (key, value) => change(tab, key, String(value)),
        removeItem: (key) => change(tab, key, null),
        key: (index) => [...entries.keys()][index] ?? null,
        get length() {
          return entries.size;
        },
      },
    };
    tabs.push(tab);
    return tab;
  }

  return { entries, openTab };
}
