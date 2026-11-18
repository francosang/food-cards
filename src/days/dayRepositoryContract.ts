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

    it("emits an empty History on subscribe when there are no Days", async () => {
      const repository = await createRepository();
      const history = recordHistory(repository);

      await settle();

      expect(history.emissions).toEqual([[]]);
    });

    it("emits every Day on subscribe, most recent date first", async () => {
      const repository = await createRepository();
      await repository.confirmChoice(LAST_WEEK, "lunch", RICE, GOAL);
      await repository.confirmChoice(TODAY, "breakfast", PORRIDGE, NEW_GOAL);
      await repository.confirmChoice(LAST_YEAR, "breakfast", TOAST, GOAL);
      await repository.confirmChoice(YESTERDAY, "breakfast", TOAST, GOAL);
      await repository.confirmChoice(YESTERDAY, "lunch", RICE, GOAL);

      const history = recordHistory(repository);
      await settle();

      expect(history.emissions).toEqual([
        [
          { date: TODAY, goal: NEW_GOAL, choices: { breakfast: PORRIDGE } },
          { date: YESTERDAY, goal: GOAL, choices: { breakfast: TOAST, lunch: RICE } },
          { date: LAST_WEEK, goal: GOAL, choices: { lunch: RICE } },
          { date: LAST_YEAR, goal: GOAL, choices: { breakfast: TOAST } },
        ],
      ]);
    });

    it("confirming and removing notify every History subscriber of the Days after the change", async () => {
      const repository = await createRepository();
      await repository.confirmChoice(YESTERDAY, "lunch", RICE, GOAL);
      const first = recordHistory(repository);
      const second = recordHistory(repository);
      await settle();

      await repository.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL);
      await settle();
      await repository.confirmChoice(YESTERDAY, "breakfast", TOAST, GOAL);
      await settle();
      await repository.removeChoice(YESTERDAY, "lunch");
      await settle();

      const expected = [
        [{ date: YESTERDAY, goal: GOAL, choices: { lunch: RICE } }],
        [
          { date: TODAY, goal: GOAL, choices: { breakfast: PORRIDGE } },
          { date: YESTERDAY, goal: GOAL, choices: { lunch: RICE } },
        ],
        [
          { date: TODAY, goal: GOAL, choices: { breakfast: PORRIDGE } },
          { date: YESTERDAY, goal: GOAL, choices: { breakfast: TOAST, lunch: RICE } },
        ],
        [
          { date: TODAY, goal: GOAL, choices: { breakfast: PORRIDGE } },
          { date: YESTERDAY, goal: GOAL, choices: { breakfast: TOAST } },
        ],
      ];
      expect(first.emissions).toEqual(expected);
      expect(second.emissions).toEqual(expected);
    });

    it("removing the last Choice of a Day takes it out of the History", async () => {
      const repository = await createRepository();
      await repository.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL);
      await repository.confirmChoice(YESTERDAY, "lunch", RICE, GOAL);
      const history = recordHistory(repository);
      await settle();

      await repository.removeChoice(YESTERDAY, "lunch");
      await settle();
      await repository.removeChoice(TODAY, "breakfast");
      await settle();

      expect(history.emissions.slice(1)).toEqual([
        [{ date: TODAY, goal: GOAL, choices: { breakfast: PORRIDGE } }],
        [],
      ]);
      const fresh = recordHistory(repository);
      await settle();
      expect(fresh.emissions).toEqual([[]]);
    });

    it("removing a Moment without a Choice does not notify the History", async () => {
      const repository = await createRepository();
      await repository.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL);
      const history = recordHistory(repository);
      await settle();

      await repository.removeChoice(TODAY, "dinner");
      await repository.removeChoice(YESTERDAY, "dinner");
      await settle();

      expect(history.emissions).toHaveLength(1);
    });

    it("stops notifying the History after unsubscribe, and unsubscribing twice is harmless", async () => {
      const repository = await createRepository();
      const gone = recordHistory(repository);
      const staying = recordHistory(repository);
      await settle();

      gone.unsubscribe();
      gone.unsubscribe();
      await repository.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL);
      await settle();

      expect(gone.emissions).toEqual([[]]);
      expect(staying.emissions).toHaveLength(2);
    });

    it("hands out History snapshots that cannot alter what is stored", async () => {
      const repository = await createRepository();
      await repository.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL);
      const received = recordHistory(repository);
      await settle();

      const days = received.last!;
      days[0].choices.breakfast!.name = "Cambiada";
      days[0].goal.daily.kcal = 1;
      days.push({ date: YESTERDAY, goal: GOAL, choices: { lunch: RICE } });

      const fresh = recordHistory(repository);
      const day = record(repository, TODAY);
      await settle();
      expect(fresh.emissions).toEqual([[{ date: TODAY, goal: GOAL, choices: { breakfast: PORRIDGE } }]]);
      expect(day.emissions).toEqual([{ date: TODAY, goal: GOAL, choices: { breakfast: PORRIDGE } }]);
    });
  });
}

/**
 * How the durable contract reaches an implementation that keeps Days outside the
 * repository instance (localStorage, Firestore), shared by several instances.
 */
export interface DurableDayRepositoryHarness<Store> {
  /** A fresh, empty store: one browser's localStorage, one Firestore emulator project. */
  createStore(): Store | Promise<Store>;
  /**
   * Opens one more instance over `store`: the app reopened, another tab, another device.
   * Changes written by the other instances must reach it the way they would in production.
   */
  open(store: Store): DayRepository | Promise<DayRepository>;
  /** Leaves unreadable data where the Day of `date` is stored. */
  corruptDay(store: Store, date: string): void | Promise<void>;
  /** Stores a Day of `date` in a schema version the implementation does not know. */
  storeUnknownSchemaDay(store: Store, date: string): void | Promise<void>;
}

/**
 * Seam 1, durable implementations only: what survives the instance and what other
 * instances see. Run it in addition to `describeDayRepositoryContract`:
 *
 *     describeDurableDayRepositoryContract("localStorage", harness);
 */
export function describeDurableDayRepositoryContract<Store>(
  name: string,
  harness: DurableDayRepositoryHarness<Store>,
) {
  describe(`DayRepository durable contract: ${name}`, () => {
    it("a new instance over the same store sees what earlier ones wrote", async () => {
      const store = await harness.createStore();
      const before = await harness.open(store);
      await before.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL);
      await before.confirmChoice(YESTERDAY, "lunch", RICE, NEW_GOAL);

      const reopened = await harness.open(store);
      const today = record(reopened, TODAY);
      const yesterday = record(reopened, YESTERDAY);
      await settle();

      expect(today.emissions).toEqual([{ date: TODAY, goal: GOAL, choices: { breakfast: PORRIDGE } }]);
      expect(yesterday.emissions).toEqual([{ date: YESTERDAY, goal: NEW_GOAL, choices: { lunch: RICE } }]);
    });

    it("notifies this instance's subscribers of writes made by another instance", async () => {
      const store = await harness.createStore();
      const here = await harness.open(store);
      const elsewhere = await harness.open(store);
      const today = record(here, TODAY);
      const yesterday = record(here, YESTERDAY);
      await settle();

      await elsewhere.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL);
      await settle();
      await elsewhere.confirmChoice(TODAY, "lunch", RICE, GOAL);
      await settle();
      await elsewhere.removeChoice(TODAY, "breakfast");
      await settle();
      await elsewhere.removeChoice(TODAY, "lunch");
      await settle();

      expect(today.emissions).toEqual([
        null,
        { date: TODAY, goal: GOAL, choices: { breakfast: PORRIDGE } },
        { date: TODAY, goal: GOAL, choices: { breakfast: PORRIDGE, lunch: RICE } },
        { date: TODAY, goal: GOAL, choices: { lunch: RICE } },
        null,
      ]);
      expect(yesterday.emissions).toEqual([null]);
    });

    it("stops notifying another instance's writes after unsubscribe", async () => {
      const store = await harness.createStore();
      const here = await harness.open(store);
      const elsewhere = await harness.open(store);
      const today = record(here, TODAY);
      await settle();

      today.unsubscribe();
      await elsewhere.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL);
      await settle();

      expect(today.emissions).toEqual([null]);
    });

    it("a new instance's History has the Days that earlier ones wrote", async () => {
      const store = await harness.createStore();
      const before = await harness.open(store);
      await before.confirmChoice(YESTERDAY, "lunch", RICE, NEW_GOAL);
      await before.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL);

      const reopened = await harness.open(store);
      const history = recordHistory(reopened);
      await settle();

      expect(history.emissions).toEqual([
        [
          { date: TODAY, goal: GOAL, choices: { breakfast: PORRIDGE } },
          { date: YESTERDAY, goal: NEW_GOAL, choices: { lunch: RICE } },
        ],
      ]);
    });

    it("notifies this instance's History of writes made by another instance, of any date", async () => {
      const store = await harness.createStore();
      const here = await harness.open(store);
      const elsewhere = await harness.open(store);
      const history = recordHistory(here);
      await settle();

      await elsewhere.confirmChoice(YESTERDAY, "lunch", RICE, GOAL);
      await settle();
      await elsewhere.confirmChoice(TODAY, "breakfast", PORRIDGE, GOAL);
      await settle();
      await elsewhere.removeChoice(YESTERDAY, "lunch");
      await settle();

      expect(history.emissions).toEqual([
        [],
        [{ date: YESTERDAY, goal: GOAL, choices: { lunch: RICE } }],
        [
          { date: TODAY, goal: GOAL, choices: { breakfast: PORRIDGE } },
          { date: YESTERDAY, goal: GOAL, choices: { lunch: RICE } },
        ],
        [{ date: TODAY, goal: GOAL, choices: { breakfast: PORRIDGE } }],
      ]);

      history.unsubscribe();
      await elsewhere.removeChoice(TODAY, "breakfast");
      await settle();
      expect(history.emissions).toHaveLength(4);
    });

    for (const [what, spoil] of [
      ["corrupt data", harness.corruptDay],
      ["a Day in an unknown schema version", harness.storeUnknownSchemaDay],
    ] as const) {
      it(`reads ${what} as an absent Day, keeping the valid Days of other dates`, async () => {
        const store = await harness.createStore();
        const before = await harness.open(store);
        await before.confirmChoice(YESTERDAY, "lunch", RICE, GOAL);
        await spoil(store, TODAY);

        const repository = await harness.open(store);
        const today = record(repository, TODAY);
        const yesterday = record(repository, YESTERDAY);
        await settle();

        expect(today.emissions).toEqual([null]);
        expect(yesterday.emissions).toEqual([{ date: YESTERDAY, goal: GOAL, choices: { lunch: RICE } }]);

        // The spoiled date can be used again; the others stay as they were.
        await repository.confirmChoice(TODAY, "breakfast", PORRIDGE, NEW_GOAL);
        await settle();
        const reopened = await harness.open(store);
        const todayAgain = record(reopened, TODAY);
        const yesterdayAgain = record(reopened, YESTERDAY);
        await settle();
        expect(todayAgain.emissions).toEqual([{ date: TODAY, goal: NEW_GOAL, choices: { breakfast: PORRIDGE } }]);
        expect(yesterdayAgain.emissions).toEqual([{ date: YESTERDAY, goal: GOAL, choices: { lunch: RICE } }]);
      });

      it(`leaves ${what} out of the History, keeping the valid Days`, async () => {
        const store = await harness.createStore();
        const before = await harness.open(store);
        await before.confirmChoice(YESTERDAY, "lunch", RICE, GOAL);
        await spoil(store, TODAY);
        await spoil(store, LAST_WEEK);

        const repository = await harness.open(store);
        const history = recordHistory(repository);
        await settle();

        expect(history.emissions).toEqual([[{ date: YESTERDAY, goal: GOAL, choices: { lunch: RICE } }]]);
      });
    }
  });
}

// --- fixtures ---

const TODAY = "2026-11-18";
const YESTERDAY = "2026-11-17";
const LAST_WEEK = "2026-11-10";
const LAST_YEAR = "2025-12-31";

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

/** Subscribes to the History and keeps every emission. */
function recordHistory(repository: DayRepository) {
  const emissions: Day[][] = [];
  const unsubscribe = repository.subscribeHistory((days) => emissions.push(days));
  return {
    emissions,
    unsubscribe,
    get last() {
      return emissions[emissions.length - 1];
    },
  };
}
