import { beforeEach } from "vitest";
import { describeDayRepositoryContract, describeDurableDayRepositoryContract } from "./dayRepositoryContract";
import { createLocalStorageDayRepository, dayStorageKey } from "./localStorageDayRepository";

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
    // Same envelope, newer version: only the version says it can't be read.
    const day = { date, goal: { daily: {}, moments: {} }, choices: { breakfast: { cardId: "des-01", grams: {} } } };
    browser.entries.set(dayStorageKey(date), JSON.stringify({ schemaVersion: 2, day }));
  },
});

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
