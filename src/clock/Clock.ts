/**
 * Source of "today" (ADR-0003). "Today" is never stored state: the app asks the clock again
 * on mount, when it comes back to the foreground and right before every write.
 */
export interface Clock {
  /** Local date as `YYYY-MM-DD`, the key of a Day. */
  today(): string;
}

/** Local date as `YYYY-MM-DD`. */
export function localDate(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** The device's clock, in its local time zone. */
export const systemClock: Clock = {
  today: () => localDate(new Date()),
};
