import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderApp } from "./test/renderApp";
import { cardFixture, cardsFileFixture } from "./test/fixtures";
import realCardsFile from "../data/tarjetas.json";

function momentRegions() {
  return screen.getAllByRole("region");
}

describe("Home", () => {
  it("shows the four Momentos in fixed order with their kcal Objetivo", () => {
    renderApp({ cardsFile: cardsFileFixture([]) });

    const banners = momentRegions().map((region) => ({
      name: within(region).getByRole("heading", { level: 2 }).textContent,
      text: region.textContent,
    }));

    expect(banners.map((b) => b.name)).toEqual(["Desayuno", "Almuerzo", "Merienda", "Cena"]);
    expect(banners[0].text).toContain("400 kcal");
    expect(banners[1].text).toContain("600 kcal");
    expect(banners[2].text).toContain("300 kcal");
    expect(banners[3].text).toContain("600 kcal");
  });

  it("lists each Momento's Tarjetas with name, kcal and P, C and G", () => {
    renderApp({
      cardsFile: cardsFileFixture([
        cardFixture({
          momento: "cena",
          nombre: "Salmón con patata",
          nutricion: { kcal: 612, prot: 54.6, carb: 49.5, grasa: 22.2, fibra: 7 },
        }),
        cardFixture({
          momento: "desayuno",
          nombre: "Porridge de avena",
          nutricion: { kcal: 408, prot: 34, carb: 44.1, grasa: 10.1, fibra: 5.7 },
        }),
        cardFixture({ momento: "desayuno", nombre: "Tostadas con pavo" }),
      ]),
    });

    const [breakfast, lunch, , dinner] = momentRegions();
    const breakfastCards = within(breakfast).getAllByRole("article");
    expect(breakfastCards.map((card) => within(card).getByRole("heading").textContent)).toEqual([
      "Porridge de avena",
      "Tostadas con pavo",
    ]);
    expect(within(lunch).queryAllByRole("article")).toEqual([]);

    const porridge = breakfastCards[0];
    expect(porridge).toHaveTextContent("408 kcal");
    expect(within(porridge).getByRole("listitem", { name: "Proteína 34 g" })).toHaveTextContent("P 34 g");
    expect(within(porridge).getByRole("listitem", { name: "Carbohidratos 44 g" })).toHaveTextContent("C 44 g");
    expect(within(porridge).getByRole("listitem", { name: "Grasas 10 g" })).toHaveTextContent("G 10 g");

    const salmon = within(dinner).getByRole("article", { name: "Salmón con patata" });
    expect(salmon).toHaveTextContent("612 kcal");
    expect(within(salmon).getByRole("listitem", { name: "Proteína 55 g" })).toBeInTheDocument();
    expect(within(salmon).getByRole("listitem", { name: "Carbohidratos 50 g" })).toBeInTheDocument();
    expect(within(salmon).getByRole("listitem", { name: "Grasas 22 g" })).toBeInTheDocument();
  });

  it("tags breakfast and snack Tarjetas as dulce or salado, but not lunch or dinner", () => {
    renderApp({
      cardsFile: cardsFileFixture([
        cardFixture({ momento: "desayuno", tipo: "dulce", nombre: "Porridge" }),
        cardFixture({ momento: "almuerzo", tipo: "salado", nombre: "Arroz con pollo" }),
        cardFixture({ momento: "merienda", tipo: "salado", nombre: "Tostada con pavo" }),
        cardFixture({ momento: "cena", tipo: "salado", nombre: "Merluza" }),
      ]),
    });

    expect(screen.getByRole("article", { name: "Porridge" })).toHaveTextContent("Dulce");
    expect(screen.getByRole("article", { name: "Tostada con pavo" })).toHaveTextContent("Salado");
    expect(screen.getByRole("article", { name: "Arroz con pollo" })).not.toHaveTextContent("Salado");
    expect(screen.getByRole("article", { name: "Merluza" })).not.toHaveTextContent("Salado");
  });

  it("shows the 7 Tarjetas of each Momento from data/tarjetas.json in file order", () => {
    renderApp();

    const namesByMoment = momentRegions().map((region) =>
      within(region)
        .getAllByRole("article")
        .map((card) => within(card).getByRole("heading").textContent),
    );
    const fileNames = (momento: string) =>
      realCardsFile.tarjetas.filter((t) => t.momento === momento).map((t) => t.nombre);

    expect(namesByMoment.map((names) => names.length)).toEqual([7, 7, 7, 7]);
    expect(namesByMoment).toEqual([
      fileNames("desayuno"),
      fileNames("almuerzo"),
      fileNames("merienda"),
      fileNames("cena"),
    ]);
  });
});
