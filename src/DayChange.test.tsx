import { act, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createFakeClock, returnToForeground } from "./test/fakeClock";
import { renderApp } from "./test/renderApp";
import { cardFixture, cardsFileFixture } from "./test/fixtures";
import { readDay } from "./test/readDay";

const TODAY = "2026-11-18";
const TOMORROW = "2026-11-19";

const cardsFile = cardsFileFixture([
  cardFixture({
    id: "des-01",
    momento: "desayuno",
    nombre: "Porridge",
    nutricion: { kcal: 408, prot: 34, carb: 44.1, grasa: 10.1, fibra: 5.7 },
  }),
  cardFixture({
    id: "cen-01",
    momento: "cena",
    nombre: "Salmón con patata",
    nutricion: { kcal: 612, prot: 54.6, carb: 49.5, grasa: 22.2, fibra: 7 },
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

describe("Changing Día without a midnight timer", () => {
  it("coming back to the foreground on the next day shows an empty Home and keeps the previous Día", async () => {
    const clock = createFakeClock(TODAY);
    const { user, repository } = renderApp({ cardsFile, clock });
    await user.click(card("Porridge"));
    await user.click(screen.getByRole("button", { name: "Confirmar desayuno" }));
    expect(progress()).toHaveTextContent("408 / 1.900 kcal");

    clock.set(TOMORROW);
    act(() => returnToForeground());

    expect(progress()).toHaveTextContent("0 / 1.900 kcal");
    expect(card("Porridge")).toHaveAttribute("aria-pressed", "false");
    expect(within(moment("Desayuno")).queryByRole("button", { name: /desayuno/i })).not.toBeInTheDocument();
    expect(await readDay(repository, TOMORROW)).toBeNull();
    expect((await readDay(repository, TODAY))?.choices.breakfast?.name).toBe("Porridge");
  });

  it("confirming after midnight with the previous day on screen stores the Elección in the new Día and shows it", async () => {
    const clock = createFakeClock(TODAY);
    const { user, repository } = renderApp({ cardsFile, clock });
    await user.click(card("Porridge"));
    await user.click(screen.getByRole("button", { name: "Confirmar desayuno" }));
    await user.click(card("Salmón con patata"));

    clock.set(TOMORROW);
    await user.click(screen.getByRole("button", { name: "Confirmar cena" }));

    expect(progress()).toHaveTextContent("612 / 1.900 kcal");
    expect(card("Salmón con patata")).toHaveAttribute("aria-pressed", "true");
    expect(card("Porridge")).toHaveAttribute("aria-pressed", "false");
    expect(within(moment("Cena")).getByRole("button", { name: "Quitar elección de cena" })).toBeInTheDocument();
    expect((await readDay(repository, TOMORROW))?.choices).toEqual({
      dinner: expect.objectContaining({ id: "cen-01" }),
    });
    expect((await readDay(repository, TODAY))?.choices).toEqual({
      breakfast: expect.objectContaining({ id: "des-01" }),
    });
  });

  it("an unconfirmed Selección disappears when the day changes", async () => {
    const clock = createFakeClock(TODAY);
    const { user, repository } = renderApp({ cardsFile, clock });
    await user.click(card("Porridge"));

    clock.set(TOMORROW);
    act(() => returnToForeground());

    expect(card("Porridge")).toHaveAttribute("aria-pressed", "false");
    expect(within(moment("Desayuno")).queryByRole("button", { name: /desayuno/i })).not.toBeInTheDocument();
    expect(await readDay(repository, TOMORROW)).toBeNull();
    expect(await readDay(repository, TODAY)).toBeNull();
  });

  it("confirming after midnight discards the Selecciones of the other Momentos", async () => {
    const clock = createFakeClock(TODAY);
    const { user, repository } = renderApp({ cardsFile, clock });
    await user.click(card("Porridge"));
    await user.click(card("Salmón con patata"));

    clock.set(TOMORROW);
    await user.click(screen.getByRole("button", { name: "Confirmar cena" }));

    expect(card("Salmón con patata")).toHaveAttribute("aria-pressed", "true");
    expect(card("Porridge")).toHaveAttribute("aria-pressed", "false");
    expect(within(moment("Desayuno")).queryByRole("button", { name: /desayuno/i })).not.toBeInTheDocument();
    expect((await readDay(repository, TOMORROW))?.choices).toEqual({
      dinner: expect.objectContaining({ id: "cen-01" }),
    });
  });

  it("unconfirming after midnight with the previous day on screen shows the new Día and leaves the previous one intact", async () => {
    const clock = createFakeClock(TODAY);
    const { user, repository } = renderApp({ cardsFile, clock });
    await user.click(card("Porridge"));
    await user.click(screen.getByRole("button", { name: "Confirmar desayuno" }));

    clock.set(TOMORROW);
    await user.click(screen.getByRole("button", { name: "Quitar elección de desayuno" }));

    expect(progress()).toHaveTextContent("0 / 1.900 kcal");
    expect(card("Porridge")).toHaveAttribute("aria-pressed", "false");
    expect(within(moment("Desayuno")).queryByRole("button", { name: /desayuno/i })).not.toBeInTheDocument();
    expect(await readDay(repository, TOMORROW)).toBeNull();
    expect((await readDay(repository, TODAY))?.choices).toEqual({
      breakfast: expect.objectContaining({ id: "des-01" }),
    });
  });
});
