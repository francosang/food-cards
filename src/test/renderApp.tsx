import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../App";
import type { CardsFile } from "../catalog";
import type { DayRepository } from "../days/DayRepository";
import { DayRepositoryProvider } from "../days/DayRepositoryProvider";
import { createMemoryDayRepository } from "../days/memoryDayRepository";
import cardsFile from "../../data/tarjetas.json";

export interface RenderAppOptions {
  /** Cards and Goals in the `data/tarjetas.json` shape. Defaults to the real file. */
  cardsFile?: CardsFile;
  /** Day repository to inject. Defaults to a fresh in-memory one. */
  repository?: DayRepository;
}

/** Seam 2: renders the whole app as the user sees it. */
export function renderApp(options: RenderAppOptions = {}) {
  const user = userEvent.setup();
  const repository = options.repository ?? createMemoryDayRepository();
  const result = render(
    <DayRepositoryProvider repository={repository}>
      <App cardsFile={options.cardsFile ?? (cardsFile as CardsFile)} />
    </DayRepositoryProvider>,
  );
  return { user, repository, ...result };
}
