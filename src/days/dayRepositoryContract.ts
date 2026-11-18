import { describe, expect, it } from "vitest";
import type { Card, Goal } from "../catalog";
import type { Day, DayRepository } from "./DayRepository";

/**
 * Seam 1: the contract every Day repository must pass, unchanged (ADR-0001).
 *
 * Run it from a `*.test.ts` file with a factory that returns a fresh, empty repository:
 *
 *     describeDayRepositoryContract("memory", () => createMemoryDayRepository());
 *
 * It only uses the public interface, so it works whether emissions are synchronous
 * (memory, localStorage) or asynchronous (Firestore): every assertion waits for the
 * repository to settle first.
 */
export function describeDayRepositoryContract(
  name: string,
  createRepository: () => DayRepository | Promise<DayRepository>,
) {
  describe(`DayRepository contract: ${name}`, () => {
    it("emits absence on subscribe when the Day does not exist", async () => {
      const repository = await createRepository();
      const day = record(repository, TODAY);

      await settle();

      expect(day.emissions).toEqual([null]);
    });

    it("confirming creates the Day with its Goal and notifies every subscriber of that date", async () => {
      const repository = await createRepository();
      const first = record(repository, TODAY);
      const second = record(repository, TODAY);
      await settle();

      await repository.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL);
      await settle();

      const expected: Day = { date: TODAY, goal: GOAL, choices: { breakfast: PORRIDGE } };
      expect(first.emissions).toEqual([null, expected]);
      expect(second.emissions).toEqual([null, expected]);
    });

    it("emits the Day on subscribe when it exists", async () => {
      const repository = await createRepository();
      await repository.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL);

      const day = record(repository, TODAY);
      await settle();

      expect(day.emissions).toEqual([{ date: TODAY, goal: GOAL, choices: { breakfast: PORRIDGE } }]);
    });

    it("confirming an already confirmed Moment replaces its Choice and keeps the Day's Goal", async () => {
      const repository = await createRepository();
      await repository.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL);
      await repository.confirmChoice(TODAY, "lunch", RICE, GOAL);

      await repository.confirmChoice(TODAY, "breakfast", TOAST, NEW_GOAL);
      const day = record(repository, TODAY);
      await settle();

      expect(day.emissions).toEqual([
        { date: TODAY, goal: GOAL, choices: { breakfast: TOAST, lunch: RICE } },
      ]);
    });

    it("removing a Choice notifies the Day without it", async () => {
      const repository = await createRepository();
      await repository.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL);
      await repository.confirmChoice(TODAY, "lunch", RICE, GOAL);
      const day = record(repository, TODAY);
      await settle();

      await repository.removeChoice(TODAY, "breakfast");
      await settle();

      expect(day.emissions.slice(1)).toEqual([{ date: TODAY, goal: GOAL, choices: { lunch: RICE } }]);
    });

    it("removing the last Choice deletes the Day", async () => {
      const repository = await createRepository();
      await repository.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL);
      const day = record(repository, TODAY);
      await settle();

      await repository.removeChoice(TODAY, "breakfast");
      await settle();

      expect(day.emissions.slice(1)).toEqual([null]);
      const fresh = record(repository, TODAY);
      await settle();
      expect(fresh.emissions).toEqual([null]);
    });

    it("removing a Moment without a Choice neither fails nor notifies", async () => {
      const repository = await createRepository();
      await repository.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL);
      const day = record(repository, TODAY);
      const empty = record(repository, YESTERDAY);
      await settle();

      await repository.removeChoice(TODAY, "dinner");
      await repository.removeChoice(YESTERDAY, "dinner");
      await settle();

      expect(day.emissions).toHaveLength(1);
      expect(empty.emissions).toEqual([null]);
    });

    it("keeps dates isolated: writing one date does not notify another", async () => {
      const repository = await createRepository();
      const today = record(repository, TODAY);
      const yesterday = record(repository, YESTERDAY);
      await settle();

      await repository.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL);
      await repository.removeChoice(TODAY, "breakfast");
      await settle();

      expect(today.emissions).toHaveLength(3);
      expect(yesterday.emissions).toEqual([null]);
    });

    it("stops notifying after unsubscribe, and unsubscribing twice is harmless", async () => {
      const repository = await createRepository();
      const gone = record(repository, TODAY);
      const staying = record(repository, TODAY);
      await settle();

      gone.unsubscribe();
      gone.unsubscribe();
      await repository.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL);
      await settle();

      expect(gone.emissions).toEqual([null]);
      expect(staying.emissions).toHaveLength(2);
    });

    it("delivers every change to every subscriber of the same date", async () => {
      const repository = await createRepository();
      const subscribers = [record(repository, TODAY), record(repository, TODAY), record(repository, TODAY)];
      await settle();

      await repository.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL);
      await repository.confirmChoice(TODAY, "lunch", RICE, GOAL);
      await repository.removeChoice(TODAY, "breakfast");
      await settle();

      for (const subscriber of subscribers) {
        expect(subscriber.last).toEqual({ date: TODAY, goal: GOAL, choices: { lunch: RICE } });
        expect(subscriber.emissions.length).toBeGreaterThanOrEqual(2);
      }
      expect(subscribers[1].emissions).toEqual(subscribers[0].emissions);
      expect(subscribers[2].emissions).toEqual(subscribers[0].emissions);
    });

    it("applies writes issued back to back, without awaiting, in order", async () => {
      const repository = await createRepository();
      const day = record(repository, TODAY);
      await settle();

      await Promise.all([
        repository.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL),
        repository.confirmChoice(TODAY, "breakfast", TOAST, GOAL),
        repository.confirmChoice(TODAY, "lunch", RICE, GOAL),
        repository.removeChoice(TODAY, "lunch"),
      ]);
      await settle();

      const expected = { date: TODAY, goal: GOAL, choices: { breakfast: TOAST } };
      expect(day.last).toEqual(expected);
      const fresh = record(repository, TODAY);
      await settle();
      expect(fresh.emissions).toEqual([expected]);
    });

    it("makes a write visible to a new subscription by the time its promise resolves", async () => {
      const repository = await createRepository();

      await repository.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL);
      const afterConfirm = record(repository, TODAY);
      await settle();
      await repository.removeChoice(TODAY, "breakfast");
      const afterRemove = record(repository, TODAY);
      await settle();

      expect(afterConfirm.emissions[0]).toEqual({ date: TODAY, goal: GOAL, choices: { breakfast: PORRIDGE } });
      expect(afterRemove.emissions).toEqual([null]);
    });

    it("hands out snapshots that cannot alter what is stored", async () => {
      const repository = await createRepository();
      const card = structuredClone(PORRIDGE);
      const goal = structuredClone(GOAL);
      await repository.confirmChoice(TODAY, "breakfast", card, goal);

      // Mutating what was written...
      card.name = "Cambiada";
      card.ingredients[0].grams = 999;
      goal.daily.kcal = 1;
      // ...and what was received.
      const received = record(repository, TODAY);
      await settle();
      const day = received.last!;
      day.choices.breakfast!.nutrition.kcal = 1;
      day.choices.lunch = RICE;
      day.goal.moments.breakfast.kcal = 1;

      const fresh = record(repository, TODAY);
      await settle();
      expect(fresh.emissions).toEqual([{ date: TODAY, goal: GOAL, choices: { breakfast: PORRIDGE } }]);
    });
  });
}

// --- fixtures ---

const TODAY = "2026-11-18";
const YESTERDAY = "2026-11-17";

const GOAL: Goal = {
  daily: { kcal: 1900, protein: 180, carbs: 175, fat: 56, fiberMin: 30 },
  moments: {
    breakfast: { kcal: 400, protein: 35, carbs: 45, fat: 9 },
    lunch: { kcal: 600, protein: 55, carbs: 55, fat: 18 },
    snack: { kcal: 300, protein: 35, carbs: 25, fat: 7 },
    dinner: { kcal: 600, protein: 55, carbs: 50, fat: 22 },
  },
};

function card(overrides: Partial<Card> & Pick<Card, "id" | "moment">): Card {
  return {
    kind: "savory",
    name: `Tarjeta ${overrides.id}`,
    ingredients: [{ id: "avena", name: "Copos de avena", grams: 40, category: "cereal" }],
    preparation: "Mezclar y calentar.",
    nutrition: { kcal: 400, protein: 35, carbs: 45, fat: 9, fiber: 5 },
    ...overrides,
  };
}

const PORRIDGE = card({ id: "des-01", moment: "breakfast", kind: "sweet", name: "Porridge" });
const TOAST = card({ id: "des-02", moment: "breakfast", name: "Tostadas con pavo" });
const RICE = card({
  id: "alm-01",
  moment: "lunch",
  name: "Arroz con pollo",
  nutrition: { kcal: 600, protein: 55, carbs: 55, fat: 18, fiber: 8 },
});

const NEW_GOAL: Goal = { ...GOAL, daily: { ...GOAL.daily, kcal: 2100 } };

// --- helpers ---

/** Lets pending emissions and resolved writes run before asserting. */
function settle() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Subscribes to a date and keeps every emission. */
function record(repository: DayRepository, date: string) {
  const emissions: (Day | null)[] = [];
  const unsubscribe = repository.subscribeDay(date, (day) => emissions.push(day));
  return {
    emissions,
    unsubscribe,
    get last() {
      return emissions[emissions.length - 1];
    },
  };
}
