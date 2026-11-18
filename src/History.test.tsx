import { act, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Card, Goal } from "./catalog";
import { createMemoryDayRepository } from "./days/memoryDayRepository";
import { createFakeClock, returnToForeground } from "./test/fakeClock";
import { DEFAULT_TODAY, renderApp } from "./test/renderApp";
import { cardFixture, cardsFileFixture } from "./test/fixtures";

const TODAY = DEFAULT_TODAY; // 2026-11-18, a Wednesday
const YESTERDAY = "2026-11-17";
const TOMORROW = "2026-11-19";

const cardsFile = cardsFileFixture([
  cardFixture({
    id: "des-01",
    momento: "desayuno",
    nombre: "Porridge",
    nutricion: { kcal: 408, prot: 34, carb: 44.1, grasa: 10.1, fibra: 5.7 },
  }),
]);

/** Goal stored with the old Days: not the current one (1.900 kcal). */
const OLD_GOAL: Goal = {
  daily: { kcal: 2100, protein: 180, carbs: 200, fat: 60, fiberMin: 30 },
  moments: {
    breakfast: { kcal: 450, protein: 35, carbs: 50, fat: 10 },
    lunch: { kcal: 650, protein: 55, carbs: 60, fat: 20 },
    snack: { kcal: 350, protein: 35, carbs: 30, fat: 8 },
    dinner: { kcal: 650, protein: 55, carbs: 60, fat: 22 },
  },
};

/** A Choice as it was when confirmed: these Cards are no longer in the catalog. */
function snapshot(id: string, moment: Card["moment"], name: string, kcal: number): Card {
  return {
    id,
    moment,
    kind: "savory",
    name,
    ingredients: [{ id: "avena", name: "Copos de avena", grams: 40, category: "cereal" }],
    preparation: "Mezclar y calentar.",
    nutrition: { kcal, protein: 30, carbs: 40, fat: 10, fiber: 5 },
  };
}

function historyHeading() {
  return screen.queryByRole("heading", { level: 1, name: "Historial" });
}

function historyDays() {
  return within(screen.getByRole("list", { name: "Días anteriores" })).getAllByRole("listitem");
}

async function openHistory(user: ReturnType<typeof renderApp>["user"]) {
  await user.click(screen.getByRole("link", { name: "Historial" }));
}

/** Each Moment of a History Day as [Moment, Card name or "—"]. */
function moments(day: HTMLElement): string[][] {
  return within(day)
    .getAllByRole("term")
    .map((term) => [term.textContent ?? "", term.nextElementSibling?.textContent ?? ""]);
}

describe("Historial", () => {
  it("opens from the header icon and goes back to the Home with the browser's back button", async () => {
    const { user } = renderApp({ cardsFile });

    await openHistory(user);

    expect(historyHeading()).toBeInTheDocument();
    expect(window.location.hash).toBe("#/historial");
    expect(screen.queryByRole("button", { name: "Porridge" })).not.toBeInTheDocument();

    window.history.back();

    await waitFor(() => expect(historyHeading()).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Porridge" })).toBeInTheDocument();
  });

  it("goes back to the Home with its button, keeping the Selections, and offers nothing else", async () => {
    const { user } = renderApp({ cardsFile });
    await user.click(screen.getByRole("button", { name: "Porridge" }));
    await openHistory(user);

    expect(screen.getAllByRole("button").map((button) => button.getAttribute("aria-label") ?? button.textContent)).toEqual([
      "Volver al Home",
    ]);
    await user.click(screen.getByRole("button", { name: "Volver al Home" }));

    await waitFor(() => expect(historyHeading()).not.toBeInTheDocument());
    expect(window.location.hash).toBe("");
    expect(screen.getByRole("button", { name: "Porridge" })).toHaveAttribute("aria-pressed", "true");
  });

  it("opens directly at #/historial and its button still leads to the Home", async () => {
    window.history.replaceState(null, "", "#/historial");
    const { user } = renderApp({ cardsFile });

    expect(historyHeading()).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Volver al Home" }));

    await waitFor(() => expect(historyHeading()).not.toBeInTheDocument());
    expect(window.location.hash).toBe("");
    expect(screen.getByRole("button", { name: "Porridge" })).toBeInTheDocument();
  });

  it("lists the Days before today, most recent first, with their stored Choices and kcal against their Goal", async () => {
    const repository = createMemoryDayRepository();
    const confirm = (date: string, card: Card) => repository.confirmChoice(date, card.moment, card, OLD_GOAL);
    await confirm("2026-10-02", snapshot("cen-09", "dinner", "Merluza al horno", 590));
    await confirm("2026-11-16", snapshot("des-07", "breakfast", "Tortitas antiguas", 420));
    await confirm("2026-11-16", snapshot("alm-07", "lunch", "Lentejas", 610));
    await confirm("2026-11-16", snapshot("mer-07", "snack", "Yogur", 300));
    await confirm("2026-11-16", snapshot("cen-07", "dinner", "Tortilla", 640));
    await confirm("2026-11-17", snapshot("alm-08", "lunch", "Arroz con pollo", 601));
    await confirm(TODAY, snapshot("des-01", "breakfast", "Porridge", 408));
    const { user } = renderApp({ cardsFile, repository });

    await openHistory(user);

    const days = historyDays();
    expect(days).toHaveLength(3);
    // Read-only: nothing to edit or delete, only the way back.
    expect(screen.getAllByRole("button")).toHaveLength(1);
    const [yesterday, twoDaysAgo, october] = days;

    expect(within(yesterday).getByRole("heading", { name: "Martes, 17 de noviembre de 2026" })).toBeInTheDocument();
    expect(yesterday).toHaveTextContent("601 / 2.100 kcal");
    expect(moments(yesterday)).toEqual([
      ["Desayuno", "—"],
      ["Almuerzo", "Arroz con pollo"],
      ["Merienda", "—"],
      ["Cena", "—"],
    ]);

    expect(within(twoDaysAgo).getByRole("heading", { name: "Lunes, 16 de noviembre de 2026" })).toBeInTheDocument();
    expect(twoDaysAgo).toHaveTextContent("1.970 / 2.100 kcal");
    expect(moments(twoDaysAgo)).toEqual([
      ["Desayuno", "Tortitas antiguas"],
      ["Almuerzo", "Lentejas"],
      ["Merienda", "Yogur"],
      ["Cena", "Tortilla"],
    ]);

    expect(within(october).getByRole("heading", { name: "Viernes, 2 de octubre de 2026" })).toBeInTheDocument();
    expect(october).toHaveTextContent("590 / 2.100 kcal");
    expect(moments(october)).toEqual([
      ["Desayuno", "—"],
      ["Almuerzo", "—"],
      ["Merienda", "—"],
      ["Cena", "Merluza al horno"],
    ]);
  });

  it("explains that there are no Days yet when only today has Choices", async () => {
    const { user } = renderApp({ cardsFile });
    await user.click(screen.getByRole("button", { name: "Porridge" }));
    await user.click(screen.getByRole("button", { name: "Confirmar desayuno" }));

    await openHistory(user);

    expect(screen.getByText("Aún no hay días anteriores.")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Días anteriores" })).not.toBeInTheDocument();
  });

  it("shows the Day created yesterday once the date has changed", async () => {
    const clock = createFakeClock(TODAY);
    const { user } = renderApp({ cardsFile, clock });
    await user.click(screen.getByRole("button", { name: "Porridge" }));
    await user.click(screen.getByRole("button", { name: "Confirmar desayuno" }));

    clock.set(TOMORROW);
    act(() => returnToForeground());
    await openHistory(user);

    const [yesterday] = historyDays();
    expect(within(yesterday).getByRole("heading", { name: "Miércoles, 18 de noviembre de 2026" })).toBeInTheDocument();
    expect(yesterday).toHaveTextContent("408 / 1.900 kcal");
    expect(moments(yesterday)[0]).toEqual(["Desayuno", "Porridge"]);
  });

  it("moves today's Day into the open Historial when the app comes back on the next day", async () => {
    const clock = createFakeClock(TODAY);
    const { user } = renderApp({ cardsFile, clock });
    await user.click(screen.getByRole("button", { name: "Porridge" }));
    await user.click(screen.getByRole("button", { name: "Confirmar desayuno" }));
    await openHistory(user);
    expect(screen.getByText("Aún no hay días anteriores.")).toBeInTheDocument();

    clock.set(TOMORROW);
    act(() => returnToForeground());

    expect(historyDays()).toHaveLength(1);
    expect(moments(historyDays()[0])[0]).toEqual(["Desayuno", "Porridge"]);
  });

  it("follows changes made to the repository while it is open", async () => {
    const { user, repository } = renderApp({ cardsFile });
    await openHistory(user);

    await act(() => repository.confirmChoice(YESTERDAY, "dinner", snapshot("cen-09", "dinner", "Merluza", 590), OLD_GOAL));

    expect(moments(historyDays()[0])[3]).toEqual(["Cena", "Merluza"]);
  });
});
