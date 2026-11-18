import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { App } from "./App";
import type { CardsFile } from "./catalog";
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App cardsFile={cardsFile as CardsFile} />
  </StrictMode>,
);
