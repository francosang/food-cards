import { act, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { parseCatalog } from "./catalog";
import { createMemoryDayRepository } from "./days/memoryDayRepository";
import { DEFAULT_TODAY, renderApp } from "./test/renderApp";
import { cardFixture, cardsFileFixture } from "./test/fixtures";
import { readDay } from "./test/readDay";

// renderApp injects a fake clock stuck on this date.
const TODAY = DEFAULT_TODAY;

const cardsFile = cardsFileFixture([
  cardFixture({
    id: "des-01",
    momento: "desayuno",
    nombre: "Porridge",
    nutricion: { kcal: 408, prot: 34, carb: 44.1, grasa: 10.1, fibra: 5.7 },
  }),
  cardFixture({
    id: "des-02",
    momento: "desayuno",
    nombre: "Tostadas con pavo",
    nutricion: { kcal: 395, prot: 36, carb: 43, grasa: 8.4, fibra: 6 },
  }),
  cardFixture({
    id: "alm-01",
    momento: "almuerzo",
    nombre: "Arroz con pollo",
    nutricion: { kcal: 601, prot: 55.2, carb: 56, grasa: 17.6, fibra: 8 },
  }),
  cardFixture({
    id: "mer-01",
    momento: "merienda",
    nombre: "Yogur con fruta",
    nutricion: { kcal: 302, prot: 34.6, carb: 25.3, grasa: 6.6, fibra: 3 },
  }),
  cardFixture({
    id: "cen-01",
    momento: "cena",
    nombre: "Salmón con patata",
    nutricion: { kcal: 612, prot: 54.6, carb: 49.5, grasa: 22.2, fibra: 7 },
  }),
  cardFixture({
    id: "cen-02",
    momento: "cena",
    nombre: "Merluza con verduras",
    nutricion: { kcal: 590, prot: 56, carb: 48, grasa: 21, fibra: 9 },
  }),
]);

function card(name: string) {
  return screen.getByRole("button", { name });
}

function moment(name: string) {
  return screen.getByRole("region", { name });
}

function progress() {
  return screen.getByRole("banner", { name: "Progreso del día" });
}

describe("Selecting and confirming a Tarjeta", () => {
  it("tapping a Tarjeta selects it and shows the tick, without changing the totals", async () => {
    const { user } = renderApp({ cardsFile });
    expect(within(moment("Desayuno")).queryByRole("button", { name: /desayuno/i })).not.toBeInTheDocument();

    await user.click(card("Porridge"));

    expect(card("Porridge")).toHaveAttribute("aria-pressed", "true");
    expect(card("Tostadas con pavo")).toHaveAttribute("aria-pressed", "false");
    expect(within(moment("Desayuno")).getByRole("button", { name: "Confirmar desayuno" })).toBeInTheDocument();
    expect(progress()).toHaveTextContent("0 / 1.900 kcal");
  });

  it("tapping another Tarjeta of the Momento moves the Selección, and tapping it again clears it", async () => {
    const { user } = renderApp({ cardsFile });
    await user.click(card("Porridge"));
    await user.click(card("Salmón con patata"));

    await user.click(card("Tostadas con pavo"));

    expect(card("Porridge")).toHaveAttribute("aria-pressed", "false");
    expect(card("Tostadas con pavo")).toHaveAttribute("aria-pressed", "true");
    expect(card("Salmón con patata")).toHaveAttribute("aria-pressed", "true");

    await user.click(card("Tostadas con pavo"));

    expect(card("Tostadas con pavo")).toHaveAttribute("aria-pressed", "false");
    expect(within(moment("Desayuno")).queryByRole("button", { name: "Confirmar desayuno" })).not.toBeInTheDocument();
    expect(within(moment("Cena")).getByRole("button", { name: "Confirmar cena" })).toBeInTheDocument();
    expect(progress()).toHaveTextContent("0 / 1.900 kcal");
  });

  it("confirming adds the Tarjeta to the Día and stores it as the Elección with the Objetivo", async () => {
    const { user, repository } = renderApp({ cardsFile });
    await user.click(card("Porridge"));

    await user.click(screen.getByRole("button", { name: "Confirmar desayuno" }));

    expect(card("Porridge")).toHaveAttribute("aria-pressed", "true");
    expect(within(moment("Desayuno")).getByRole("button", { name: "Quitar elección de desayuno" })).toBeInTheDocument();
    expect(progress()).toHaveTextContent("408 / 1.900 kcal");
    expect(screen.getByRole("progressbar", { name: "Kcal" })).toHaveAttribute("aria-valuenow", "408");
    expect(progress()).toHaveTextContent("P 34 / 180 g");
    expect(progress()).toHaveTextContent("C 44 / 175 g");
    expect(progress()).toHaveTextContent("G 10 / 56 g");

    const day = await readDay(repository, TODAY);
    expect(day).toEqual({
      date: TODAY,
      goal: {
        daily: { kcal: 1900, protein: 180, carbs: 175, fat: 56, fiberMin: 30 },
        moments: {
          breakfast: { kcal: 400, protein: 35, carbs: 45, fat: 9 },
          lunch: { kcal: 600, protein: 55, carbs: 55, fat: 18 },
          snack: { kcal: 300, protein: 35, carbs: 25, fat: 7 },
          dinner: { kcal: 600, protein: 55, carbs: 50, fat: 22 },
        },
      },
      choices: {
        breakfast: {
          id: "des-01",
          moment: "breakfast",
          kind: "sweet",
          name: "Porridge",
          ingredients: [{ id: "avena", name: "Copos de avena", grams: 40, category: "cereal" }],
          preparation: "Mezclar y calentar.",
          nutrition: { kcal: 408, protein: 34, carbs: 44.1, fat: 10.1, fiber: 5.7 },
        },
      },
    });
  });

  it("ignores taps on the Tarjetas of a confirmed Momento", async () => {
    const { user, repository } = renderApp({ cardsFile });
    await user.click(card("Porridge"));
    await user.click(screen.getByRole("button", { name: "Confirmar desayuno" }));

    await user.click(card("Tostadas con pavo"));
    await user.click(card("Porridge"));

    expect(card("Porridge")).toHaveAttribute("aria-pressed", "true");
    expect(card("Tostadas con pavo")).toHaveAttribute("aria-pressed", "false");
    expect(within(moment("Desayuno")).getByRole("button", { name: "Quitar elección de desayuno" })).toBeInTheDocument();
    expect(progress()).toHaveTextContent("408 / 1.900 kcal");
    expect((await readDay(repository, TODAY))?.choices.breakfast?.name).toBe("Porridge");
  });

  it("unconfirming subtracts the Tarjeta and leaves it selected", async () => {
    const { user, repository } = renderApp({ cardsFile });
    await user.click(card("Porridge"));
    await user.click(screen.getByRole("button", { name: "Confirmar desayuno" }));
    await user.click(card("Arroz con pollo"));
    await user.click(screen.getByRole("button", { name: "Confirmar almuerzo" }));

    await user.click(screen.getByRole("button", { name: "Quitar elección de desayuno" }));

    expect(progress()).toHaveTextContent("601 / 1.900 kcal");
    expect(card("Porridge")).toHaveAttribute("aria-pressed", "true");
    expect(within(moment("Desayuno")).getByRole("button", { name: "Confirmar desayuno" })).toBeInTheDocument();
    expect((await readDay(repository, TODAY))?.choices).toEqual({
      lunch: expect.objectContaining({ id: "alm-01" }),
    });

    // Still a plain Selección: it can be moved again.
    await user.click(card("Tostadas con pavo"));
    expect(card("Tostadas con pavo")).toHaveAttribute("aria-pressed", "true");
    expect(card("Porridge")).toHaveAttribute("aria-pressed", "false");
  });

  it("adds up four Elecciones against the daily Objetivo", async () => {
    const { user } = renderApp({ cardsFile });

    for (const [name, label] of [
      ["Tostadas con pavo", "Confirmar desayuno"],
      ["Arroz con pollo", "Confirmar almuerzo"],
      ["Yogur con fruta", "Confirmar merienda"],
      ["Salmón con patata", "Confirmar cena"],
    ]) {
      await user.click(card(name));
      await user.click(screen.getByRole("button", { name: label }));
    }

    // 395 + 601 + 302 + 612; P 36 + 55.2 + 34.6 + 54.6; C 43 + 56 + 25.3 + 49.5; G 8.4 + 17.6 + 6.6 + 22.2
    expect(progress()).toHaveTextContent("1.910 / 1.900 kcal");
    expect(progress()).toHaveTextContent("P 180 / 180 g");
    expect(progress()).toHaveTextContent("C 174 / 175 g");
    expect(progress()).toHaveTextContent("G 55 / 56 g");
    expect(screen.getByRole("progressbar", { name: "Proteína" })).toHaveAttribute("aria-valuenow", "180");
  });

  it("shows the Elecciones already stored for today as confirmed on mount, against the Día's Objetivo", async () => {
    const repository = createMemoryDayRepository();
    const stored = parseCatalog(cardsFile);
    const oldGoal = { ...stored.goal, daily: { ...stored.goal.daily, kcal: 2000 } };
    await repository.confirmChoice(TODAY, "dinner", stored.cards.dinner[1], oldGoal);
    await repository.confirmChoice("2026-11-17", "breakfast", stored.cards.breakfast[0], stored.goal);

    renderApp({ cardsFile, repository });

    expect(await screen.findByRole("button", { name: "Quitar elección de cena" })).toBeInTheDocument();
    expect(card("Merluza con verduras")).toHaveAttribute("aria-pressed", "true");
    expect(card("Porridge")).toHaveAttribute("aria-pressed", "false");
    expect(progress()).toHaveTextContent("590 / 2.000 kcal");
  });

  it("reflects a change made to the repository outside the UI", async () => {
    const { repository } = renderApp({ cardsFile });
    const { cards, goal } = parseCatalog(cardsFile);

    await act(() => repository.confirmChoice(TODAY, "snack", cards.snack[0], goal));

    expect(card("Yogur con fruta")).toHaveAttribute("aria-pressed", "true");
    expect(progress()).toHaveTextContent("302 / 1.900 kcal");

    await act(() => repository.removeChoice(TODAY, "snack"));

    expect(card("Yogur con fruta")).toHaveAttribute("aria-pressed", "false");
    expect(progress()).toHaveTextContent("0 / 1.900 kcal");
  });
});
