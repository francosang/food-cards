import { MOMENTS, type Nutrition } from "./catalog";
import type { Day } from "./days/DayRepository";

export const ZERO: Nutrition = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

/** Progress of a Day: only its Choices count. */
export function dayTotals(day: Day | null | undefined): Nutrition {
  return MOMENTS.reduce((sum, moment) => {
    const choice = day?.choices[moment];
    return choice ? addNutrition(sum, choice.nutrition) : sum;
  }, ZERO);
}

export function addNutrition(a: Nutrition, b: Nutrition): Nutrition {
  return {
    kcal: a.kcal + b.kcal,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
  };
}
