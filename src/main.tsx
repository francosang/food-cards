import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { App } from "./App";
import type { CardsFile } from "./catalog";
import { systemClock } from "./clock/Clock";
import { ClockProvider } from "./clock/ClockProvider";
import { DayRepositoryProvider } from "./days/DayRepositoryProvider";
import { createMemoryDayRepository } from "./days/memoryDayRepository";
import cardsFile from "../data/tarjetas.json";
import "./index.css";

// Offline support. With `autoUpdate`, a new deploy's service worker takes over and the page reloads.
// An installed app can stay open for days, so also look for a new version whenever it comes back to the foreground.
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return;
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") void registration.update();
    });
  },
});

// In memory for now: Choices are lost on reload until ticket 03 swaps in localStorage.
const repository = createMemoryDayRepository();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClockProvider clock={systemClock}>
      <DayRepositoryProvider repository={repository}>
        <App cardsFile={cardsFile as CardsFile} />
      </DayRepositoryProvider>
    </ClockProvider>
  </StrictMode>,
);
