import { beforeEach, describe, expect, it } from "vitest";
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
  storeWrongShapeDay: (browser, date) => {
    const day = { date, goal: {}, choices: { breakfast: { id: "des-01", name: "Porridge" } } };
    browser.entries.set(dayStorageKey(date), JSON.stringify({ schemaVersion: SCHEMA_VERSION, day }));
  },
});

describe("localStorage: a stored Day in the wrong shape reads as absent", () => {
  const DATE = "2026-11-18";
  type Spoil = (day: Record<string, any>) => unknown;
  const cases: [string, Spoil][] = [
    ["no Day at all", () => null],
    ["an empty Goal", (day) => ({ ...day, goal: {} })],
    ["a daily Goal without fiberMin", (day) => (delete day.goal.daily.fiberMin, day)],
    ["a Goal missing a Moment", (day) => (delete day.goal.moments.dinner, day)],
    ["a Goal with a number as text", (day) => ((day.goal.moments.lunch.kcal = "600"), day)],
    ["a Goal with a null number", (day) => ((day.goal.daily.kcal = null), day)],
    ["choices as a list", (day) => ({ ...day, choices: [PORRIDGE] })],
    ["no Choices", (day) => ({ ...day, choices: {} })],
    ["a Choice under an unknown Moment", (day) => ({ ...day, choices: { ...day.choices, brunch: PORRIDGE } })],
    ["a Choice under another Moment", (day) => ({ ...day, choices: { lunch: PORRIDGE } })],
    ["a null Choice", (day) => ({ ...day, choices: { breakfast: null } })],
    ["a Choice without nutrition", (day) => (delete day.choices.breakfast.nutrition, day)],
    ["a Choice without fiber", (day) => (delete day.choices.breakfast.nutrition.fiber, day)],
    ["a Choice with an unknown kind", (day) => ((day.choices.breakfast.kind = "spicy"), day)],
    ["a Choice without a name", (day) => (delete day.choices.breakfast.name, day)],
    ["a Choice without preparation", (day) => (delete day.choices.breakfast.preparation, day)],
    ["ingredients that are not a list", (day) => ((day.choices.breakfast.ingredients = {}), day)],
    ["an ingredient with grams as text", (day) => ((day.choices.breakfast.ingredients[0].grams = "40"), day)],
    ["an ingredient with a non-text household unit", (day) => ((day.choices.breakfast.ingredients[0].householdUnit = 2), day)],
  ];

  it("reads a valid Day stored the same way", async () => {
    store(validDay());
    expect(await firstEmission()).toEqual(validDay());
  });

  for (const [what, spoil] of cases) {
    it(`with ${what}`, async () => {
      store(spoil(validDay()));
      expect(await firstEmission()).toBeNull();
    });
  }

  function validDay(): Record<string, any> {
    return structuredClone({ date: DATE, goal: GOAL, choices: { breakfast: PORRIDGE } });
  }

  function store(day: unknown) {
    localStorage.setItem(dayStorageKey(DATE), JSON.stringify({ schemaVersion: SCHEMA_VERSION, day }));
  }

  function firstEmission(): Promise<Day | null> {
    return new Promise((resolve) => createLocalStorageDayRepository().subscribeDay(DATE, resolve)());
  }
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
