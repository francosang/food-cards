import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import type { CardsFile } from "./catalog";
import cardsFile from "../data/tarjetas.json";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App cardsFile={cardsFile as CardsFile} />
  </StrictMode>,
);
