import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../App";
import type { CardsFile } from "../catalog";
import cardsFile from "../../data/tarjetas.json";

export interface RenderAppOptions {
  /** Cards and Goals in the `data/tarjetas.json` shape. Defaults to the real file. */
  cardsFile?: CardsFile;
}

/** Seam 2: renders the whole app as the user sees it. */
export function renderApp(options: RenderAppOptions = {}) {
  const user = userEvent.setup();
  const result = render(<App cardsFile={options.cardsFile ?? (cardsFile as CardsFile)} />);
  return { user, ...result };
}
