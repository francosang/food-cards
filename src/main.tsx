import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import type { CardsFile } from "./catalog";
import { DayRepositoryProvider } from "./days/DayRepositoryProvider";
import { createMemoryDayRepository } from "./days/memoryDayRepository";
import cardsFile from "../data/tarjetas.json";
import "./index.css";

// In memory for now: Choices are lost on reload until ticket 03 swaps in localStorage.
const repository = createMemoryDayRepository();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DayRepositoryProvider repository={repository}>
      <App cardsFile={cardsFile as CardsFile} />
    </DayRepositoryProvider>
  </StrictMode>,
);
