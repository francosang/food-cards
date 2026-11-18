import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderApp } from "./test/renderApp";
import { cardFixture, cardsFileFixture } from "./test/fixtures";

type User = ReturnType<typeof renderApp>["user"];

const cardsFile = cardsFileFixture([
  cardFixture({
    id: "des-01",
    momento: "desayuno",
    tipo: "salado",
    nombre: "Tostadas con pavo",
    ingredientes: [
      { id: "pan_integral", g: 60, nombre: "Pan de molde 100 % integral", categoria: "cereal", unidad_casera: "2 rebanadas" },
      { id: "pavo", g: 80, nombre: "Pechuga de pavo", categoria: "proteina" },
    ],
    preparacion: "Tostar el pan y añadir el pavo.",
    nutricion: { kcal: 395, prot: 36.4, carb: 43.2, grasa: 8.4, fibra: 6.1 },
  }),
  cardFixture({ id: "des-02", momento: "desayuno", nombre: "Porridge" }),
]);

function cardArticle(name: string) {
  return screen.getByRole("article", { name });
}

function cardButton(name: string) {
  return screen.getByRole("button", { name });
}

describe("Viewing a Tarjeta's details", () => {
  it("shows 'Ver detalles' only inside the selected Tarjeta, named after it", async () => {
    const { user } = renderApp({ cardsFile });
    expect(screen.queryByRole("button", { name: /Ver detalles/ })).not.toBeInTheDocument();

    await user.click(cardButton("Tostadas con pavo"));

    const details = within(cardArticle("Tostadas con pavo")).getByRole("button", { name: "Ver detalles de Tostadas con pavo" });
    expect(details).toBeVisible();
    expect(details).toHaveTextContent("Ver detalles");
    expect(within(cardArticle("Porridge")).queryByRole("button", { name: /Ver detalles/ })).not.toBeInTheDocument();
  });

  it("opens a dialog with the Momento, kind, nutrition with fiber, ingredients and preparation", async () => {
    const { user } = renderApp({ cardsFile });
    await user.click(cardButton("Tostadas con pavo"));

    await user.click(within(cardArticle("Tostadas con pavo")).getByRole("button", { name: "Ver detalles de Tostadas con pavo" }));

    const dialog = screen.getByRole("dialog", { name: "Tostadas con pavo" });
    expect(dialog).toHaveTextContent("Desayuno");
    expect(dialog).toHaveTextContent("Salado");

    const nutrition = within(dialog).getByRole("list", { name: "Nutrición" });
    expect(within(nutrition).getByRole("listitem", { name: "395 kcal" })).toBeInTheDocument();
    expect(within(nutrition).getByRole("listitem", { name: "Proteína 36 g" })).toBeInTheDocument();
    expect(within(nutrition).getByRole("listitem", { name: "Carbohidratos 43 g" })).toBeInTheDocument();
    expect(within(nutrition).getByRole("listitem", { name: "Grasas 8 g" })).toBeInTheDocument();
    expect(within(nutrition).getByRole("listitem", { name: "Fibra 6 g" })).toBeInTheDocument();

    const ingredients = within(within(dialog).getByRole("list", { name: "Ingredientes" })).getAllByRole("listitem");
    expect(ingredients).toHaveLength(2);
    expect(ingredients[0]).toHaveTextContent("Pan de molde 100 % integral");
    expect(ingredients[0]).toHaveTextContent("60 g");
    expect(ingredients[0]).toHaveTextContent("2 rebanadas");
    expect(ingredients[1]).toHaveTextContent("Pechuga de pavo");
    expect(ingredients[1]).toHaveTextContent("80 g");

    expect(within(dialog).getByRole("heading", { name: "Preparación" })).toBeInTheDocument();
    expect(dialog).toHaveTextContent("Tostar el pan y añadir el pavo.");
  });

  it("is read-only: it has no confirm action", async () => {
    const { user } = renderApp({ cardsFile });
    await user.click(cardButton("Tostadas con pavo"));
    await user.click(screen.getByRole("button", { name: "Ver detalles de Tostadas con pavo" }));

    const buttons = within(screen.getByRole("dialog")).getAllByRole("button");
    expect(buttons.map((b) => b.getAttribute("aria-label") ?? b.textContent)).toEqual(["Cerrar"]);
  });

  it.each([
    ["the close button", async (user: User) => user.click(screen.getByRole("button", { name: "Cerrar" }))],
    ["Escape", async (user: User) => user.keyboard("{Escape}")],
    ["a click on the backdrop", async (user: User) => user.click(screen.getByRole("dialog"))],
  ])("closes with %s, keeping the Selección", async (_how, closeWith) => {
    const { user } = renderApp({ cardsFile });
    await user.click(cardButton("Tostadas con pavo"));
    await user.click(screen.getByRole("button", { name: "Ver detalles de Tostadas con pavo" }));
    expect(screen.getByRole("dialog")).toBeVisible();

    await closeWith(user);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(cardButton("Tostadas con pavo")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Confirmar desayuno" })).toBeInTheDocument();
  });

  it("stays open when clicking inside it", async () => {
    const { user } = renderApp({ cardsFile });
    await user.click(cardButton("Tostadas con pavo"));
    await user.click(screen.getByRole("button", { name: "Ver detalles de Tostadas con pavo" }));

    await user.click(within(screen.getByRole("dialog")).getByRole("heading", { name: "Preparación" }));

    expect(screen.getByRole("dialog")).toBeVisible();
  });

  it("is also available on the confirmed Tarjeta, and viewing it keeps the Elección", async () => {
    const { user } = renderApp({ cardsFile });
    await user.click(cardButton("Tostadas con pavo"));
    await user.click(screen.getByRole("button", { name: "Confirmar desayuno" }));

    await user.click(within(cardArticle("Tostadas con pavo")).getByRole("button", { name: "Ver detalles de Tostadas con pavo" }));
    expect(screen.getByRole("dialog", { name: "Tostadas con pavo" })).toBeVisible();
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(cardButton("Tostadas con pavo")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Quitar elección de desayuno" })).toBeInTheDocument();
    expect(screen.getByRole("banner", { name: "Progreso del día" })).toHaveTextContent("395 / 1.900 kcal");
  });
});
