import type { Day, DayRepository } from "./DayRepository";

/** Reads a Day once, through the repository's public interface: its first emission. */
export function readDay(repository: DayRepository, date: string): Promise<Day | null> {
  return new Promise((resolve) => {
    let unsubscribe: (() => void) | undefined;
    let done = false;
    unsubscribe = repository.subscribeDay(date, (day) => {
      if (done) return;
      done = true;
      resolve(day);
      unsubscribe?.();
    });
    if (done) unsubscribe();
  });
}
