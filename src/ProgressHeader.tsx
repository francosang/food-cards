import type { Nutrition } from "./catalog";
import { formatGrams, formatKcal } from "./format";
import { MACRO_STYLES, MACROS } from "./macros";
import { HISTORY_HASH, openHistory } from "./route";

const KCAL_BAR = { fill: "bg-ink", ghost: "bg-ink/30", track: "bg-line" };
const EXCEEDED_BAR = { fill: "bg-exceeded", ghost: "bg-exceeded/40", track: "bg-exceeded-soft" };

interface ProgressHeaderProps {
  /** Sum of the Day's Choices. */
  totals: Nutrition;
  /** What the unconfirmed Selections would add (ghost segment). Never part of `totals`. */
  preview: Nutrition;
  /** Daily Goal: the Day's snapshot, or the current Goal while the Day does not exist. */
  goal: Nutrition;
}

function percent(value: number, max: number): number {
  return max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
}

/** Compared as displayed (whole numbers), so "180 / 180 g" never reads as exceeded. */
function exceeds(value: number, goal: number): boolean {
  return Math.round(value) > Math.round(goal);
}

interface BarProps {
  label: string;
  value: number;
  preview: number;
  goal: number;
  /** "408 / 1.900 kcal": the confirmed progress, as shown next to the bar. */
  text: string;
  /** "+600 kcal previstas", read only while there is a preview. */
  previewText: string;
  colors: { fill: string; ghost: string; track: string };
  className: string;
}

function Bar({ label, value, preview, goal, text, previewText, colors, className }: BarProps) {
  const hasPreview = Math.round(preview) > 0;
  const exceeded = exceeds(value, goal);
  const wouldExceed = !exceeded && hasPreview && exceeds(value + preview, goal);
  const { fill, ghost, track } = exceeded || wouldExceed ? EXCEEDED_BAR : colors;
  const filled = percent(value, goal);
  const ghosted = Math.min(100 - filled, percent(preview, goal));
  const valueText = [
    text,
    hasPreview ? previewText : null,
    exceeded ? "Objetivo superado" : null,
    wouldExceed ? "superaría el Objetivo" : null,
  ]
    .filter(Boolean)
    .join(", ");
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.round(goal)}
      aria-valuenow={Math.min(Math.round(value), Math.round(goal))}
      aria-valuetext={valueText}
      data-exceeded={exceeded || wouldExceed ? "" : undefined}
      className={`flex overflow-hidden rounded-full ${track} ${className}`}
    >
      <div className={`h-full rounded-full ${fill}`} style={{ width: `${filled}%` }} />
      {/* Ghost segment: the unconfirmed Selections, right after the confirmed progress. */}
      {hasPreview && <div className={`h-full rounded-r-full ${ghost}`} style={{ width: `${ghosted}%` }} />}
    </div>
  );
}

/** Sticky header with the Day's progress towards the daily Goal. */
export function ProgressHeader({ totals, preview, goal }: ProgressHeaderProps) {
  const kcalPreview = `+${formatKcal(preview.kcal)} kcal previstas`;
  return (
    <header aria-label="Progreso del día" className="sticky top-0 z-10 border-b border-line bg-page/95 backdrop-blur">
      <div className="mx-auto max-w-screen-sm px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            <span className="text-2xl font-bold tracking-tight text-ink">{formatKcal(totals.kcal)}</span> /{" "}
            {formatKcal(goal.kcal)} kcal
            {Math.round(preview.kcal) > 0 && <span className="ml-2 text-xs">{kcalPreview}</span>}
          </p>
          <a
            href={HISTORY_HASH}
            onClick={openHistory}
            aria-label="Historial"
            title="Historial"
            className="-mr-2 grid size-10 shrink-0 place-items-center rounded-full text-muted hover:bg-tag hover:text-ink"
          >
            <HistoryIcon />
          </a>
        </div>
        <Bar
          label="Kcal"
          value={totals.kcal}
          preview={preview.kcal}
          goal={goal.kcal}
          text={`${formatKcal(totals.kcal)} / ${formatKcal(goal.kcal)} kcal`}
          previewText={kcalPreview}
          colors={KCAL_BAR}
          className="mt-1 h-2.5"
        />
        <div className="mt-2 grid grid-cols-3 gap-3">
          {MACROS.map((key) => {
            const { short, label, fill, ghost, track } = MACRO_STYLES[key];
            const text = `${formatGrams(totals[key])} / ${formatGrams(goal[key])} g`;
            return (
              <div key={key}>
                <p className="text-xs text-muted">
                  <span className="font-semibold">{short}</span> {text}
                </p>
                <Bar
                  label={label}
                  value={totals[key]}
                  preview={preview[key]}
                  goal={goal[key]}
                  text={text}
                  previewText={`+${formatGrams(preview[key])} g previstos`}
                  colors={{ fill, ghost, track }}
                  className="mt-1 h-1.5"
                />
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}

/** A clock with a back arrow: past Days. */
function HistoryIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
