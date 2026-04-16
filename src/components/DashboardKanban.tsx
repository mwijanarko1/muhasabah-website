"use client";

import Link from "next/link";
import type { ActivityDayModel, ActivityLevel, KanbanColumnId, CategoryCardModel } from "@/lib/dashboardStats";

function dashboardLegalContact(): { href: string; label: string } {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  if (email) {
    return { href: `mailto:${encodeURIComponent(email)}`, label: "Contact" };
  }
  return { href: "/privacy#contact", label: "Contact / privacy requests" };
}

const COLUMNS: { id: KanbanColumnId; title: string; subtitle: string; accent: string }[] = [
  {
    id: "care",
    title: "Needs care",
    subtitle: "Room to grow",
    accent: "border-rose-200 bg-rose-50/90 dark:border-rose-900/50 dark:bg-rose-950/30",
  },
  {
    id: "steady",
    title: "Steady",
    subtitle: "On track",
    accent: "border-amber-200 bg-amber-50/90 dark:border-amber-900/50 dark:bg-amber-950/25",
  },
  {
    id: "thrive",
    title: "Thriving",
    subtitle: "Strong today",
    accent: "border-emerald-200 bg-emerald-50/90 dark:border-emerald-900/50 dark:bg-emerald-950/25",
  },
];

export type DashboardStatStrip = {
  todayTotal: number | null;
  streak: number;
  weekAverage: number | null;
  weekDaysWithData: number;
  daysLogged: number;
  dataSourceLabel: string;
};

type DashboardKanbanProps = {
  statStrip: DashboardStatStrip;
  cards: CategoryCardModel[];
  activityDays: ActivityDayModel[];
  hasCompletedToday: boolean;
};

function groupByColumn(cards: CategoryCardModel[]): Record<KanbanColumnId, CategoryCardModel[]> {
  const empty: Record<KanbanColumnId, CategoryCardModel[]> = {
    care: [],
    steady: [],
    thrive: [],
  };
  for (const c of cards) {
    empty[c.column].push(c);
  }
  return empty;
}

function KanbanCard({ card }: { card: CategoryCardModel }) {
  return (
    <article
      className="rounded-xl border border-gray-200/80 bg-white/90 p-3 shadow-sm dark:border-gray-600/80 dark:bg-gray-800/90"
      aria-label={card.label}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-gray-900 dark:text-white">{card.shortLabel}</h3>
        <span className="shrink-0 rounded-lg bg-indigo-100 px-2 py-0.5 font-mono text-xs tabular-nums text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-200">
          {card.display}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full rounded-full bg-indigo-500 transition-[width] dark:bg-indigo-400"
          style={{ width: `${card.percent}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">{card.maxLabel}</p>
    </article>
  );
}

const legalLinkClass =
  "text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400";

const activityLevelClass: Record<ActivityLevel, string> = {
  0: "bg-gray-200 dark:bg-gray-700",
  1: "bg-emerald-200 dark:bg-emerald-950",
  2: "bg-emerald-300 dark:bg-emerald-800",
  3: "bg-emerald-500 dark:bg-emerald-600",
  4: "bg-emerald-700 dark:bg-emerald-400",
};

export function DashboardKanban({
  statStrip,
  cards,
  activityDays,
  hasCompletedToday,
}: DashboardKanbanProps) {
  const grouped = groupByColumn(cards);
  const contact = dashboardLegalContact();

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-indigo-50 via-white to-purple-50 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 sm:px-6">
      <main id="main-content" className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8">
        <header className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {hasCompletedToday ? "You're caught up for today" : "Finish today's reflection"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
            {hasCompletedToday
              ? "Your reflection scores grouped like a board: areas that need care, what's steady, and where you're thriving, plus a quick read on streaks and recent averages."
              : "Your account is ready. Complete today's reflection when you're ready, then return for the summary."}
          </p>
          {hasCompletedToday && (
            <p className="mt-4">
              <Link
                href="/today?edit=1"
                className="inline-flex min-h-11 items-center rounded-xl border border-indigo-200 bg-white px-5 text-sm font-semibold text-indigo-700 shadow-sm active:bg-indigo-50 dark:border-indigo-800 dark:bg-gray-800 dark:text-indigo-200 dark:active:bg-gray-700"
              >
                Edit today&apos;s reflection
              </Link>
            </p>
          )}
        </header>

        {!hasCompletedToday && (
          <section
            aria-label="Today incomplete"
            className="rounded-2xl border border-indigo-200 bg-white/90 p-5 shadow-sm dark:border-indigo-900/40 dark:bg-gray-800/80"
          >
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Today&apos;s reflection is still open.
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Finish it when you are ready. Your synced summary will update after saving.
            </p>
            <Link
              href="/today"
              className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white active:bg-indigo-700"
            >
              Finish today&apos;s reflection
            </Link>
          </section>
        )}

        <section aria-label="Summary statistics" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-indigo-200/80 bg-white/90 p-4 shadow-sm dark:border-indigo-900/40 dark:bg-gray-800/80">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Today&apos;s total</p>
            <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
              {statStrip.todayTotal === null ? "—" : statStrip.todayTotal}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Range −20 to 100</p>
          </div>
          <div className="rounded-2xl border border-indigo-200/80 bg-white/90 p-4 shadow-sm dark:border-indigo-900/40 dark:bg-gray-800/80">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Current streak</p>
            <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
              {statStrip.streak}
              <span className="ml-1 text-lg font-semibold text-gray-500 dark:text-gray-400">days</span>
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Consecutive days with an entry</p>
          </div>
          <div className="rounded-2xl border border-indigo-200/80 bg-white/90 p-4 shadow-sm dark:border-indigo-900/40 dark:bg-gray-800/80">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">7-day average</p>
            <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
              {statStrip.weekAverage === null ? "—" : statStrip.weekAverage.toFixed(1)}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              From {statStrip.weekDaysWithData} day{statStrip.weekDaysWithData === 1 ? "" : "s"} in the last week
            </p>
          </div>
          <div className="rounded-2xl border border-indigo-200/80 bg-white/90 p-4 shadow-sm dark:border-indigo-900/40 dark:bg-gray-800/80">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Days logged</p>
            <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
              {statStrip.daysLogged}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{statStrip.dataSourceLabel}</p>
          </div>
        </section>

        <section
          aria-label="Activity chart"
          className="rounded-2xl border border-indigo-200/80 bg-white/90 p-4 shadow-sm dark:border-indigo-900/40 dark:bg-gray-800/80"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Activity</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Recent saved reflection totals</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Less to more</p>
          </div>
          <div
            className="mt-4 grid grid-flow-col grid-rows-7 justify-start gap-1 overflow-x-auto pb-1"
            aria-label="Daily reflection activity"
          >
            {activityDays.map((day) => (
              <span
                key={day.dateKey}
                aria-label={day.label}
                title={day.label}
                className={`h-3 w-3 rounded-[3px] ${activityLevelClass[day.level]}`}
              />
            ))}
          </div>
        </section>

        <section aria-label="Score kanban" className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today by area</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cards sort into columns by how strong each area is today (relative to its max).
            </p>
          </div>

          {cards.length === 0 ? (
            <div className="rounded-2xl border border-indigo-200/80 bg-white/90 p-5 text-sm text-gray-600 shadow-sm dark:border-indigo-900/40 dark:bg-gray-800/80 dark:text-gray-300">
              No saved scores for today yet.
            </div>
          ) : (
            <div className="grid flex-1 gap-4 lg:grid-cols-3">
              {COLUMNS.map((col) => (
                <div
                  key={col.id}
                  className={`flex min-h-[12rem] flex-col rounded-2xl border-2 p-3 ${col.accent} dark:border-opacity-60`}
                >
                  <div className="mb-3 border-b border-black/5 pb-2 dark:border-white/10">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{col.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{col.subtitle}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {grouped[col.id].length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Nothing here today.</p>
                    ) : (
                      grouped[col.id].map((card) => <KanbanCard key={card.id} card={card} />)
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-10 border-t border-indigo-200/70 pt-6 dark:border-indigo-900/50">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Legal
          </h2>
          <nav aria-label="Legal and contact" className="mt-3">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <Link href="/terms" className={legalLinkClass}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={legalLinkClass}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href={contact.href} className={legalLinkClass}>
                  {contact.label}
                </a>
              </li>
            </ul>
          </nav>
        </footer>
      </main>
    </div>
  );
}
