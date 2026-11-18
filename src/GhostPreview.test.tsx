import { act, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEFAULT_TODAY, renderApp } from "./test/renderApp";
import { cardFixture, cardsFileFixture, choiceFixture, goalFixture } from "./test/fixtures";

// Daily Objetivo of the fixture: 1.900 kcal, P 180, C 175, G 56.
const cardsFile = cardsFileFixture([
  cardFixture({
    id: "des-01",
    momento: "desayuno",
    nombre: "Porridge",
    nutricion: { kcal: 408, prot: 34, carb: 44.1, grasa: 10.1, fibra: 5.7 },
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
]);

function card(name: string) {
  return screen.getByRole("button", { name });
}

function progress() {
  return screen.getByRole("banner", { name: "Progreso del día" });
}

function bar(name: "Kcal" | "Proteína" | "Carbohidratos" | "Grasas") {
  return screen.getByRole("progressbar", { name });
}

describe("Ghost preview of the unconfirmed Selecciones", () => {
  it("selecting a Tarjeta previews its contribution without changing the confirmed totals", async () => {
    const { user } = renderApp({ cardsFile });

    await user.click(card("Porridge"));

    expect(progress()).toHaveTextContent("0 / 1.900 kcal");
    expect(progress()).toHaveTextContent("+408 kcal previstas");
    expect(bar("Kcal")).toHaveAttribute("aria-valuenow", "0");
    expect(bar("Kcal")).toHaveAttribute("aria-valuetext", "0 / 1.900 kcal, +408 kcal previstas");
    expect(progress()).toHaveTextContent("P 0 / 180 g");
    expect(bar("Proteína")).toHaveAttribute("aria-valuenow", "0");
    expect(bar("Proteína")).toHaveAttribute("aria-valuetext", "0 / 180 g, +34 g previstos");
    expect(bar("Carbohidratos")).toHaveAttribute("aria-valuetext", "0 / 175 g, +44 g previstos");
    expect(bar("Grasas")).toHaveAttribute("aria-valuetext", "0 / 56 g, +10 g previstos");
  });

  it("confirming turns the preview into progress, without counting the Elección twice", async () => {
    const { user } = renderApp({ cardsFile });
    await user.click(card("Porridge"));
    await user.click(card("Arroz con pollo"));
    expect(progress()).toHaveTextContent("+1.009 kcal previstas");

    await user.click(screen.getByRole("button", { name: "Confirmar desayuno" }));

    expect(progress()).toHaveTextContent("408 / 1.900 kcal");
    expect(progress()).toHaveTextContent("+601 kcal previstas");
    expect(bar("Kcal")).toHaveAttribute("aria-valuetext", "408 / 1.900 kcal, +601 kcal previstas");
    expect(bar("Proteína")).toHaveAttribute("aria-valuetext", "34 / 180 g, +55 g previstos");

    await user.click(screen.getByRole("button", { name: "Confirmar almuerzo" }));

    expect(progress()).toHaveTextContent("1.009 / 1.900 kcal");
    expect(progress()).not.toHaveTextContent("previstas");
    expect(bar("Kcal")).toHaveAttribute("aria-valuetext", "1.009 / 1.900 kcal");
    expect(bar("Grasas")).toHaveAttribute("aria-valuetext", "28 / 56 g");
  });

  it("removing the Selección removes its preview", async () => {
    const { user } = renderApp({ cardsFile });
    await user.click(card("Porridge"));

    await user.click(card("Porridge"));

    expect(progress()).toHaveTextContent("0 / 1.900 kcal");
    expect(progress()).not.toHaveTextContent("previstas");
    expect(bar("Kcal")).toHaveAttribute("aria-valuetext", "0 / 1.900 kcal");
    expect(bar("Carbohidratos")).toHaveAttribute("aria-valuetext", "0 / 175 g");
  });

  it("unconfirming an Elección turns it back into a preview", async () => {
    const { user } = renderApp({ cardsFile });
    await user.click(card("Porridge"));
    await user.click(screen.getByRole("button", { name: "Confirmar desayuno" }));

    await user.click(screen.getByRole("button", { name: "Quitar elección de desayuno" }));

    expect(progress()).toHaveTextContent("0 / 1.900 kcal");
    expect(bar("Kcal")).toHaveAttribute("aria-valuetext", "0 / 1.900 kcal, +408 kcal previstas");
  });

  it("ignores the Selección of a Momento confirmed from elsewhere, so it is not counted twice", async () => {
    const { user, repository } = renderApp({ cardsFile });
    await user.click(card("Porridge"));
    await user.click(card("Arroz con pollo"));

    await act(() => repository.confirmChoice(DEFAULT_TODAY, "lunch", choiceFixture(cardsFile, "alm-01"), goalFixture));

    expect(progress()).toHaveTextContent("601 / 1.900 kcal");
    expect(bar("Kcal")).toHaveAttribute("aria-valuetext", "601 / 1.900 kcal, +408 kcal previstas");
  });
});

describe("Exceeding the Objetivo", () => {
  async function confirm(user: ReturnType<typeof renderApp>["user"], name: string, moment: string) {
    await user.click(card(name));
    await user.click(screen.getByRole("button", { name: `Confirmar ${moment}` }));
  }

  it("marks the bars whose confirmed total is above the Objetivo as exceeded", async () => {
    const { user } = renderApp({ cardsFile });

    await confirm(user, "Porridge", "desayuno");
    await confirm(user, "Arroz con pollo", "almuerzo");
    await confirm(user, "Yogur con fruta", "merienda");
    await confirm(user, "Salmón con patata", "cena");

    // 408 + 601 + 302 + 612 kcal; G 10.1 + 17.6 + 6.6 + 22.2; P 34 + 55.2 + 34.6 + 54.6
    expect(progress()).toHaveTextContent("1.923 / 1.900 kcal");
    expect(bar("Kcal")).toHaveAttribute("aria-valuetext", "1.923 / 1.900 kcal, Objetivo superado");
    expect(bar("Grasas")).toHaveAttribute("aria-valuetext", "57 / 56 g, Objetivo superado");
    expect(bar("Proteína")).toHaveAttribute("aria-valuetext", "178 / 180 g");
    expect(bar("Carbohidratos")).toHaveAttribute("aria-valuetext", "175 / 175 g");
  });

  it("warns that confirming the Selección would exceed the Objetivo, without changing the confirmed totals", async () => {
    const { user } = renderApp({ cardsFile });
    await confirm(user, "Porridge", "desayuno");
    await confirm(user, "Arroz con pollo", "almuerzo");
    await confirm(user, "Yogur con fruta", "merienda");

    await user.click(card("Salmón con patata"));

    expect(progress()).toHaveTextContent("1.311 / 1.900 kcal");
    expect(bar("Kcal")).toHaveAttribute(
      "aria-valuetext",
      "1.311 / 1.900 kcal, +612 kcal previstas, superaría el Objetivo",
    );
    expect(bar("Grasas")).toHaveAttribute("aria-valuetext", "34 / 56 g, +22 g previstos, superaría el Objetivo");
    expect(bar("Proteína")).toHaveAttribute("aria-valuetext", "124 / 180 g, +55 g previstos");
  });
});
