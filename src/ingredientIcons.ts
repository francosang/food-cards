/**
 * Ingredient → icon. Icons are Fluent Emoji Flat SVGs (Microsoft, MIT, see
 * `src/assets/ingredients/LICENSE`), bundled by Vite so they work offline.
 * An ingredient without its own icon (claras, whey, queso batido…) or a new one
 * missing here gets its category's icon; an unknown category gets "otro".
 */
import type { Card, Ingredient } from "./catalog";
import avocado from "./assets/ingredients/avocado_flat.svg";
import banana from "./assets/ingredients/banana_flat.svg";
import beans from "./assets/ingredients/beans_flat.svg";
import bellPepper from "./assets/ingredients/bell_pepper_flat.svg";
import blueberries from "./assets/ingredients/blueberries_flat.svg";
import bread from "./assets/ingredients/bread_flat.svg";
import broccoli from "./assets/ingredients/broccoli_flat.svg";
import cannedFood from "./assets/ingredients/canned_food_flat.svg";
import carrot from "./assets/ingredients/carrot_flat.svg";
import chestnut from "./assets/ingredients/chestnut_flat.svg";
import chocolateBar from "./assets/ingredients/chocolate_bar_flat.svg";
import cookedRice from "./assets/ingredients/cooked_rice_flat.svg";
import cutOfMeat from "./assets/ingredients/cut_of_meat_flat.svg";
import earOfCorn from "./assets/ingredients/ear_of_corn_flat.svg";
import egg from "./assets/ingredients/egg_flat.svg";
import fish from "./assets/ingredients/fish_flat.svg";
import flatbread from "./assets/ingredients/flatbread_flat.svg";
import flexedBiceps from "./assets/ingredients/flexed_biceps_flat_default.svg";
import forkAndKnifeWithPlate from "./assets/ingredients/fork_and_knife_with_plate_flat.svg";
import glassOfMilk from "./assets/ingredients/glass_of_milk_flat.svg";
import greenSalad from "./assets/ingredients/green_salad_flat.svg";
import honeyPot from "./assets/ingredients/honey_pot_flat.svg";
import kiwiFruit from "./assets/ingredients/kiwi_fruit_flat.svg";
import leafyGreen from "./assets/ingredients/leafy_green_flat.svg";
import olive from "./assets/ingredients/olive_flat.svg";
import peaPod from "./assets/ingredients/pea_pod_flat.svg";
import peanuts from "./assets/ingredients/peanuts_flat.svg";
import potato from "./assets/ingredients/potato_flat.svg";
import poultryLeg from "./assets/ingredients/poultry_leg_flat.svg";
import redApple from "./assets/ingredients/red_apple_flat.svg";
import roastedSweetPotato from "./assets/ingredients/roasted_sweet_potato_flat.svg";
import sheafOfRice from "./assets/ingredients/sheaf_of_rice_flat.svg";
import shrimp from "./assets/ingredients/shrimp_flat.svg";
import spaghetti from "./assets/ingredients/spaghetti_flat.svg";
import squid from "./assets/ingredients/squid_flat.svg";
import strawberry from "./assets/ingredients/strawberry_flat.svg";
import tomato from "./assets/ingredients/tomato_flat.svg";
import turkey from "./assets/ingredients/turkey_flat.svg";

/** Fallback per `categoria` of `data/ingredientes.json`. */
const CATEGORY_ICONS: Record<string, string> = {
  lacteo: glassOfMilk,
  proteina: flexedBiceps,
  pescado: fish,
  legumbre: beans,
  cereal: sheafOfRice,
  tuberculo: potato,
  verdura: leafyGreen,
  fruta: redApple,
  grasa: olive,
  otro: forkAndKnifeWithPlate,
};

/** Own icons by ingredient id of `data/ingredientes.json`; the rest use their category's. */
const INGREDIENT_ICONS: Record<string, string> = {
  huevo: egg,
  pechuga_pollo: poultryLeg,
  pechuga_pavo: turkey,
  pavo_lonchas: turkey,
  lomo_cerdo: cutOfMeat,
  ternera_picada_5: cutOfMeat,
  sepia: squid,
  gambas: shrimp,
  atun_natural: cannedFood,
  pan_integral: bread,
  tortilla_integral: flatbread,
  tortitas_maiz: earOfCorn,
  arroz_vasito: cookedRice,
  arroz_integral_vasito: cookedRice,
  pasta_integral: spaghetti,
  boniato: roastedSweetPotato,
  brocoli: broccoli,
  judias_verdes: peaPod,
  pimiento_cebolla: bellPepper,
  ensalada: greenSalad,
  tomate: tomato,
  tomate_triturado: tomato,
  zanahoria: carrot,
  platano: banana,
  frutos_rojos: blueberries,
  fresas: strawberry,
  kiwi: kiwiFruit,
  nueces: chestnut,
  almendras: chestnut,
  crema_cacahuete: peanuts,
  aguacate: avocado,
  cacao_puro: chocolateBar,
  miel: honeyPot,
};

export function ingredientIcon(ingredient: Pick<Ingredient, "id" | "category">): string {
  return INGREDIENT_ICONS[ingredient.id] ?? CATEGORY_ICONS[ingredient.category] ?? CATEGORY_ICONS.otro;
}

/** At most this many icons fit on a Card. */
const MAX_MAIN_INGREDIENTS = 4;

/** Oil is always weighed in, but it's not what makes a Card recognisable. */
function isOil(ingredient: Ingredient): boolean {
  return ingredient.id.startsWith("aceite");
}

/** The Card's heaviest ingredients, oil excluded, heaviest first (ties keep recipe order). */
export function mainIngredients(card: Card): Ingredient[] {
  return card.ingredients
    .filter((ingredient) => !isOil(ingredient))
    .sort((a, b) => b.grams - a.grams)
    .slice(0, MAX_MAIN_INGREDIENTS);
}
