import { MOMENT_LABELS, MOMENTS } from "./catalog";
import { useToday } from "./clock/ClockProvider";
import type { Day } from "./days/DayRepository";
import { useAllDays } from "./days/DayRepositoryProvider";
import { formatDate, formatKcal } from "./format";
import { dayTotals } from "./progress";
import { goHome } from "./route";

/**
 * The Historial: read-only list of the Days before today, most recent first. Shows each
 * Day's stored snapshots (its Choices and Goal), never the current Cards (ADR-0002).
 */
export function HistoryView() {
  const { today } = useToday();
  const days = useAllDays()?.filter((day) => day.date < today);

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-line bg-page/95 backdrop-blur">
        <div className="mx-auto flex max-w-screen-sm items-center gap-1 px-2 py-3">
          <button
            type="button"
            aria-label="Volver al Home"
            title="Volver"
            onClick={goHome}
            className="grid size-10 shrink-0 place-items-center rounded-full text-ink hover:bg-tag"
          >
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
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Historial</h1>
        </div>
      </header>
      <main className="mx-auto max-w-screen-sm px-4 py-3">
        {days?.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-semibold">Aún no hay días anteriores.</p>
            <p className="mt-1 text-sm text-muted">Cada día que confirmes Tarjetas aparecerá aquí a partir del día siguiente.</p>
          </div>
        )}
        {days && days.length > 0 && (
          <ol aria-label="Días anteriores" className="flex flex-col gap-3">
            {days.map((day) => (
              <li key={day.date}>
                <HistoryDay day={day} />
              </li>
            ))}
          </ol>
        )}
      </main>
    </>
  );
}

function HistoryDay({ day }: { day: Day }) {
  const headingId = `history-${day.date}`;
  return (
    <article aria-labelledby={headingId} className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 id={headingId} className="font-semibold">
          {formatDate(day.date)}
        </h2>
        <p className="text-sm text-muted">
          {formatKcal(dayTotals(day).kcal)} / {formatKcal(day.goal.daily.kcal)} kcal
        </p>
      </div>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        {MOMENTS.map((moment) => (
          <div key={moment} className="contents">
            <dt className="text-muted">{MOMENT_LABELS[moment]}</dt>
            <dd>{day.choices[moment]?.name ?? "—"}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
