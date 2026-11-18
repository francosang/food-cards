import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Clock } from "./Clock";

const ClockContext = createContext<Clock | null>(null);

/** Injects the clock that says which date is "today" (ADR-0003). */
export function ClockProvider({ clock, children }: { clock: Clock; children: ReactNode }) {
  return <ClockContext.Provider value={clock}>{children}</ClockContext.Provider>;
}

export function useClock(): Clock {
  const clock = useContext(ClockContext);
  if (!clock) throw new Error("useClock needs a <ClockProvider>");
  return clock;
}

/**
 * "Today" as `YYYY-MM-DD`. Read from the clock on mount and again whenever the page becomes
 * visible. There is no midnight timer on purpose (ADR-0003): call `refresh()` right before a
 * write to get the real date; it also moves `today` to it if the date has changed.
 */
export function useToday(): { today: string; refresh: () => string } {
  const clock = useClock();
  const [today, setToday] = useState(() => clock.today());

  const refresh = useCallback(() => {
    const date = clock.today();
    setToday(date);
    return date;
  }, [clock]);

  useEffect(() => {
    refresh(); // The clock may have been swapped since the first render.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [refresh]);

  return { today, refresh };
}
