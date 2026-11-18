import type { Nutrition } from "./catalog";

/** The Macros: protein, carbs and fat. Kcal and fiber are shown next to them but are not Macros. */
export type Macro = keyof Omit<Nutrition, "kcal">;

export const MACROS: readonly Macro[] = ["protein", "carbs", "fat"];

interface MacroStyle {
  /** One letter, for tight spaces: "P", "C", "G". */
  short: string;
  label: string;
  /** Soft background with coloured text: chips. */
  chip: string;
  /** Progress bars: the confirmed segment, the ghost preview and the track behind them. */
  fill: string;
  ghost: string;
  track: string;
}

// Full class names, written out so Tailwind finds them in the source.
export const MACRO_STYLES: Record<Macro, MacroStyle> = {
  protein: {
    short: "P",
    label: "Proteína",
    chip: "bg-protein-soft text-protein",
    fill: "bg-protein",
    ghost: "bg-protein/35",
    track: "bg-protein-soft",
  },
  carbs: {
    short: "C",
    label: "Carbohidratos",
    chip: "bg-carbs-soft text-carbs",
    fill: "bg-carbs",
    ghost: "bg-carbs/35",
    track: "bg-carbs-soft",
  },
  fat: {
    short: "G",
    label: "Grasas",
    chip: "bg-fat-soft text-fat",
    fill: "bg-fat",
    ghost: "bg-fat/35",
    track: "bg-fat-soft",
  },
};
