import type { Clock } from "../clock/Clock";

export interface FakeClock extends Clock {
  /** Moves the clock to `date` (`YYYY-MM-DD`). The app only notices when it reads the clock again. */
  set(date: string): void;
}

export function createFakeClock(date: string): FakeClock {
  let current = date;
  return {
    today: () => current,
    set: (next) => {
      current = next;
    },
  };
}

/** Simulates the app coming back to the foreground (`visibilitychange` to visible). */
export function returnToForeground() {
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
  document.dispatchEvent(new Event("visibilitychange"));
}
