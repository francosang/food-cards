import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseCatalog } from "./catalog";
import type { DayRepository } from "./days/DayRepository";
import { createMemoryDayRepository } from "./days/memoryDayRepository";
import { renderApp } from "./test/renderApp";
import { cardFixture, cardsFileFixture } from "./test/fixtures";
import { localDate } from "./today";

const TODAY = localDate();

const cardsFile = cardsFileFixture([
  cardFixture({ id: "des-01", momento: "desayuno", nombre: "Porridge" }),
  cardFixture({ id: "des-02", momento: "desayuno", nombre: "Tostadas con pavo" }),
  cardFixture({ id: "des-03", momento: "desayuno", nombre: "Tortilla de claras" }),
  cardFixture({ id: "alm-01", momento: "almuerzo", nombre: "Arroz con pollo" }),
  cardFixture({ id: "alm-02", momento: "almuerzo", nombre: "Lentejas" }),
  cardFixture({ id: "mer-01", momento: "merienda", nombre: "Yogur con fruta" }),
  cardFixture({ id: "cen-01", momento: "cena", nombre: "Salmón con patata" }),
  cardFixture({ id: "cen-02", momento: "cena", nombre: "Merluza con verduras" }),
]);
const catalog = parseCatalog(cardsFile);

// jsdom has no layout: lay the Cards of each carousel out in a row, one every CARD_PITCH px.
const CARD_PITCH = 268;
const CAROUSEL_PADDING = 16;
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function (this: HTMLElement) {
    if (this.tagName !== "LI" || !this.parentElement?.matches("[aria-label^='Tarjetas']")) return 0;
    return CAROUSEL_PADDING + [...this.parentElement.children].indexOf(this) * CARD_PITCH;
  });
});
afterEach(() => {
  vi.restoreAllMocks();
});

function carousel(moment: string) {
  return screen.getByRole("list", { name: `Tarjetas de ${moment}` });
}

describe("Carousel position on load", () => {
  it("scrolls the carousel of each Momento with an Elección to its Tarjeta; the others start at the first", async () => {
    const repository = createMemoryDayRepository();
    await repository.confirmChoice(TODAY, "breakfast", catalog.cards.breakfast[2], catalog.goal);
    await repository.confirmChoice(TODAY, "dinner", catalog.cards.dinner[1], catalog.goal);

    renderApp({ cardsFile, repository });

    expect(await screen.findByRole("button", { name: "Quitar elección de cena" })).toBeInTheDocument();
    expect(carousel("desayuno").scrollLeft).toBe(2 * CARD_PITCH);
    expect(carousel("cena").scrollLeft).toBe(CARD_PITCH);
    expect(carousel("almuerzo").scrollLeft).toBe(0);
    expect(carousel("merienda").scrollLeft).toBe(0);
  });

  it("also does it when the Día arrives after the first render, as it will from Firestore", async () => {
    const repository = createMemoryDayRepository();
    await repository.confirmChoice(TODAY, "lunch", catalog.cards.lunch[1], catalog.goal);

    renderApp({ cardsFile, repository: delayFirstEmission(repository) });

    expect(await screen.findByRole("button", { name: "Quitar elección de almuerzo" })).toBeInTheDocument();
    expect(carousel("almuerzo").scrollLeft).toBe(CARD_PITCH);
    expect(carousel("desayuno").scrollLeft).toBe(0);
  });
});

/** Same repository, but every subscription receives its first emission in a later task. */
function delayFirstEmission(repository: DayRepository): DayRepository {
  return {
    ...repository,
    subscribeDay(date, listener) {
      let active = true;
      let unsubscribe = () => {};
      const timer = setTimeout(() => {
        if (active) unsubscribe = repository.subscribeDay(date, listener);
      }, 10);
      return () => {
        active = false;
        clearTimeout(timer);
        unsubscribe();
      };
    },
  };
}
