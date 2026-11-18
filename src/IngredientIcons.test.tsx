import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderApp } from "./test/renderApp";
import { cardFixture, cardsFileFixture } from "./test/fixtures";

function mainIngredientIcons(cardName: string) {
  const card = screen.getByRole("article", { name: cardName });
  return within(within(card).getByRole("list", { name: "Ingredientes principales" })).getAllByRole("img");
}

describe("Ingredient icons", () => {
  it("shows a known Tarjeta's main ingredients by weight, without the oil", () => {
    renderApp();

    const icons = mainIngredientIcons("Pollo al curry con arroz y brócoli");

    expect(icons.map((icon) => icon.getAttribute("alt"))).toEqual([
      "Brócoli congelado",
      "Pechuga de pollo",
      "Arroz cocido (vasito o congelado)",
    ]);
  });

  it("shows at most four icons", () => {
    renderApp();

    const icons = mainIngredientIcons("Chili de ternera con alubias y arroz");

    expect(icons.map((icon) => icon.getAttribute("alt"))).toEqual([
      "Carne picada de vacuno 5 % grasa",
      "Alubias cocidas (bote)",
      "Tomate triturado (bote)",
      "Pimiento y cebolla (fresco o congelado)",
    ]);
  });

  it("uses the category's icon for an ingredient without its own, including one the mapping doesn't know", () => {
    renderApp({
      cardsFile: cardsFileFixture([
        cardFixture({
          nombre: "Kéfir con claras",
          ingredientes: [
            { id: "kefir", g: 200, nombre: "Kéfir", categoria: "lacteo" },
            { id: "claras", g: 150, nombre: "Claras de huevo pasteurizadas", categoria: "proteina" },
            { id: "chia", g: 10, nombre: "Semillas de chía", categoria: "semillas" },
          ],
        }),
      ]),
    });

    const [kefir, claras, chia] = mainIngredientIcons("Kéfir con claras");

    expect(kefir).toHaveAttribute("src", expect.stringContaining("glass_of_milk"));
    expect(claras).toHaveAttribute("src", expect.stringContaining("flexed_biceps"));
    expect(chia).toHaveAttribute("src", expect.stringContaining("fork_and_knife_with_plate"));
  });

  it("shows each ingredient's icon in the details dialog, the oil included", async () => {
    const { user } = renderApp();
    const card = screen.getByRole("article", { name: "Lomo de cerdo con patatas y judías verdes" });
    await user.click(within(card).getByRole("button", { name: "Lomo de cerdo con patatas y judías verdes" }));
    await user.click(within(card).getByRole("button", { name: "Ver detalles de Lomo de cerdo con patatas y judías verdes" }));

    const dialog = screen.getByRole("dialog", { name: "Lomo de cerdo con patatas y judías verdes" });
    const ingredients = within(within(dialog).getByRole("list", { name: "Ingredientes" })).getAllByRole("listitem");

    expect(
      ingredients.map((ingredient) => [ingredient.textContent, within(ingredient).getByRole("presentation").getAttribute("src")]),
    ).toEqual([
      [expect.stringContaining("Lomo de cerdo"), expect.stringContaining("cut_of_meat")],
      [expect.stringContaining("Patata"), expect.stringContaining("potato")],
      [expect.stringContaining("Judías verdes"), expect.stringContaining("pea_pod")],
      [expect.stringContaining("Aceite de oliva"), expect.stringContaining("olive")],
    ]);
  });
});
