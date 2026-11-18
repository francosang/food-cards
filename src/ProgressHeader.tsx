import type { Nutrition } from "./catalog";
import { formatGrams, formatKcal } from "./format";

const MACRO_BARS = [
  { key: "protein", short: "P", label: "Proteína", fill: "bg-protein", track: "bg-protein-soft" },
  { key: "carbs", short: "C", label: "Carbohidratos", fill: "bg-carbs", track: "bg-carbs-soft" },
  { key: "fat", short: "G", label: "Grasas", fill: "bg-fat", track: "bg-fat-soft" },
] as const;

interface ProgressHeaderProps {
  /** Sum of the Day's Choices. */
  totals: Nutrition;
  /** Daily Goal: the Day's snapshot, or the current Goal while the Day does not exist. */
  goal: Nutrition;
}

function percent(value: number, max: number): number {
  return max > 0 ? Math.min(100, (value / max) * 100) : 0;
}

/** Sticky header with the Day's progress towards the daily Goal. */
export function ProgressHeader({ totals, goal }: ProgressHeaderProps) {
  const kcal = `${formatKcal(totals.kcal)} / ${formatKcal(goal.kcal)} kcal`;
  return (
    <header aria-label="Progreso del día" className="sticky top-0 z-10 border-b border-line bg-page/95 backdrop-blur">
      <div className="mx-auto max-w-screen-sm px-4 py-3">
        <p className="text-sm text-muted">
          <span className="text-2xl font-bold tracking-tight text-ink">{formatKcal(totals.kcal)}</span> /{" "}
          {formatKcal(goal.kcal)} kcal
        </p>
        <div
          role="progressbar"
          aria-label="Kcal"
          aria-valuemin={0}
          aria-valuemax={Math.round(goal.kcal)}
          aria-valuenow={Math.round(totals.kcal)}
          aria-valuetext={kcal}
          className="mt-1 h-2.5 overflow-hidden rounded-full bg-line"
        >
          <div className="h-full rounded-full bg-ink" style={{ width: `${percent(totals.kcal, goal.kcal)}%` }} />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {MACRO_BARS.map(({ key, short, label, fill, track }) => {
            const text = `${formatGrams(totals[key])} / ${formatGrams(goal[key])} g`;
            return (
              <div key={key}>
                <p className="text-xs text-muted">
                  <span className="font-semibold">{short}</span> {text}
                </p>
                <div
                  role="progressbar"
                  aria-label={label}
                  aria-valuemin={0}
                  aria-valuemax={Math.round(goal[key])}
                  aria-valuenow={Math.round(totals[key])}
                  aria-valuetext={text}
                  className={`mt-1 h-1.5 overflow-hidden rounded-full ${track}`}
                >
                  <div
                    className={`h-full rounded-full ${fill}`}
                    style={{ width: `${percent(totals[key], goal[key])}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
