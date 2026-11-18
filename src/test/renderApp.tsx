import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../App";
import type { CardsFile } from "../catalog";
import type { Clock } from "../clock/Clock";
import { ClockProvider } from "../clock/ClockProvider";
import type { DayRepository } from "../days/DayRepository";
import { DayRepositoryProvider } from "../days/DayRepositoryProvider";
import { createMemoryDayRepository } from "../days/memoryDayRepository";
import { createFakeClock } from "./fakeClock";
import cardsFile from "../../data/tarjetas.json";

/** The date the default fake clock is stuck on. */
export const DEFAULT_TODAY = "2026-11-18";

export interface RenderAppOptions {
  /** Cards and Goals in the `data/tarjetas.json` shape. Defaults to the real file. */
  cardsFile?: CardsFile;
  /** Day repository to inject. Defaults to a fresh in-memory one. */
  repository?: DayRepository;
  /** Clock to inject. Defaults to a fake clock stuck on `DEFAULT_TODAY`. */
  clock?: Clock;
}

/** Seam 2: renders the whole app as the user sees it. */
export function renderApp(options: RenderAppOptions = {}) {
  const user = userEvent.setup();
  const repository = options.repository ?? createMemoryDayRepository();
  const clock = options.clock ?? createFakeClock(DEFAULT_TODAY);
  const result = render(
    <ClockProvider clock={clock}>
      <DayRepositoryProvider repository={repository}>
        <App cardsFile={options.cardsFile ?? (cardsFile as CardsFile)} />
      </DayRepositoryProvider>
    </ClockProvider>,
  );
  return { user, repository, clock, ...result };
}
