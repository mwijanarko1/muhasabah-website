"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { TouchEvent } from "react";
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
    accent: "border-rose-200 bg-rose-50/80 dark:border-rose-900/50 dark:bg-rose-950/30",
  },
  {
    id: "steady",
    title: "Steady",
    subtitle: "On track",
    accent: "border-brand-periwinkle/30 bg-brand-periwinkle/10 dark:border-brand-periwinkle/40 dark:bg-brand-periwinkle/5",
  },
  {
    id: "thrive",
    title: "Thriving",
    subtitle: "Strong today",
    accent: "border-brand-accent/20 bg-brand-mint dark:border-brand-accent/40 dark:bg-brand-accent/10",
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

export type KanbanDayNavigation = {
  /** Short label, e.g. "Today" or "Wed, Apr 10" */
  dateLabel: string;
  isToday: boolean;
  onPreviousDay: () => void;
  onNextDay: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
};

type DashboardKanbanProps = {
  statStrip: DashboardStatStrip;
  cards: CategoryCardModel[];
  activityDays: ActivityDayModel[];
  hasCompletedToday: boolean;
  savePrompt?: {
    authError?: string | null;
    onSignIn: () => void;
  };
  profileMenu?: {
    onSignOut: () => void;
  };
  /** Swipe / buttons to browse the score board by calendar day (previous days). */
  kanbanDayNavigation?: KanbanDayNavigation;
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
      className="rounded-2xl border border-brand-periwinkle/20 bg-brand-white/90 p-4 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800/90"
      aria-label={card.label}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-display font-bold leading-snug text-brand-ink dark:text-brand-white">{card.shortLabel}</h3>
        <span className="shrink-0 rounded-lg bg-brand-alice px-2 py-0.5 font-mono-brand text-xs font-bold tabular-nums text-brand-accent dark:bg-brand-accent/20 dark:text-brand-periwinkle">
          {card.display}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-alice dark:bg-gray-700">
        <div
          className="h-full rounded-full bg-brand-accent transition-[width] duration-500 ease-out"
          style={{ width: `${card.percent}%` }}
        />
      </div>
      <p className="mt-2 text-[10px] font-mono-brand font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{card.maxLabel}</p>
    </article>
  );
}

const legalLinkClass =
  "text-brand-accent underline-offset-4 hover:underline decoration-brand-periwinkle/50 dark:text-brand-periwinkle";

const SWIPE_THRESHOLD_PX = 56;

const activityLevelClass: Record<ActivityLevel, string> = {
  0: "bg-gray-200 dark:bg-gray-700",
  1: "bg-brand-mint dark:bg-brand-accent/10",
  2: "bg-brand-periwinkle/40 dark:bg-brand-accent/30",
  3: "bg-brand-periwinkle dark:bg-brand-accent/60",
  4: "bg-brand-accent dark:bg-brand-accent",
};

const ACTIVITY_LEGEND_LEVELS: ActivityLevel[] = [0, 1, 2, 3, 4];

function ActivityIntensityLegend() {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400"
      aria-label="Intensity from less to more: no entry, then lighter to darker green"
    >
      <span>Less</span>
      <div className="flex gap-px">
        {ACTIVITY_LEGEND_LEVELS.map((level) => (
          <span
            key={level}
            className={`h-3.5 w-3.5 rounded-[2px] ${activityLevelClass[level]}`}
            aria-hidden
            title={
              level === 0
                ? "No entry"
                : level === 4
                  ? "Strongest activity"
                  : `Level ${level}`
            }
          />
        ))}
      </div>
      <span>More</span>
    </div>
  );
}

export function DashboardKanban({
  statStrip,
  cards,
  activityDays,
  hasCompletedToday,
  savePrompt,
  profileMenu,
  kanbanDayNavigation,
}: DashboardKanbanProps) {
  const grouped = groupByColumn(cards);
  const contact = dashboardLegalContact();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const onKanbanTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onKanbanTouchEnd = (e: TouchEvent) => {
    if (
      touchStartX.current === null ||
      touchStartY.current === null ||
      !kanbanDayNavigation
    ) {
      return;
    }
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.2) return;
    if (dx > 0 && kanbanDayNavigation.canGoNext) {
      kanbanDayNavigation.onNextDay();
    } else if (dx < 0 && kanbanDayNavigation.canGoPrevious) {
      kanbanDayNavigation.onPreviousDay();
    }
  };

  const onKanbanTouchCancel = () => {
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const kanbanTitle = kanbanDayNavigation
    ? kanbanDayNavigation.isToday
      ? "Today by area"
      : `${kanbanDayNavigation.dateLabel} · by area`
    : "Today by area";

  const kanbanEmptyMessage =
    cards.length === 0
      ? kanbanDayNavigation && !kanbanDayNavigation.isToday
        ? `No reflection saved for ${kanbanDayNavigation.dateLabel}.`
        : "No saved scores for today yet."
      : "";

  return (
    <div className="flex min-h-dvh flex-col bg-brand-alice/30 dark:bg-gray-950 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6">
      <main id="main-content" className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8">
        <header className="flex flex-col gap-4 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div>
            <p className="text-xs font-mono-brand font-semibold uppercase tracking-wider text-brand-accent">
              Dashboard
            </p>
            <h1 className="mt-1 text-3xl font-display font-bold tracking-tight text-brand-ink dark:text-brand-white">
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
                  className="inline-flex min-h-11 items-center rounded-xl border-2 border-brand-periwinkle/30 bg-brand-white px-5 text-sm font-semibold text-brand-accent shadow-sm hover:shadow-md transition-all active:scale-95 dark:bg-gray-900 dark:text-brand-periwinkle"
                >
                  Edit today&apos;s reflection
                </Link>
              </p>
            )}
          </div>

          {profileMenu && (
            <div className="relative self-center sm:self-start">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
                aria-expanded={isProfileMenuOpen}
                className="inline-flex min-h-11 items-center rounded-xl border-2 border-brand-periwinkle/30 bg-brand-white px-4 text-sm font-semibold text-brand-accent shadow-sm hover:shadow-md transition-all active:scale-95 dark:bg-gray-900 dark:text-brand-periwinkle"
              >
                Profile
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 z-10 mt-2 min-w-36 rounded-xl border border-brand-periwinkle/20 bg-brand-white p-2 text-left shadow-xl dark:bg-gray-800">
                  <button
                    type="button"
                    onClick={profileMenu.onSignOut}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-gray-800 hover:bg-brand-mint active:bg-brand-alice dark:text-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        {savePrompt && (
          <section
            aria-label="Save progress"
            className="rounded-2xl border-2 border-brand-periwinkle/20 bg-brand-white/80 backdrop-blur-sm p-5 shadow-sm dark:bg-gray-800/80"
          >
            <p className="text-sm font-display font-semibold text-brand-ink dark:text-brand-white">
              If you want to save your progress, sign in.
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              This dashboard is temporary. Refreshing the page will clear it from this browser.
            </p>
            {savePrompt.authError && (
              <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
                {savePrompt.authError}
              </p>
            )}
            <button
              type="button"
              onClick={savePrompt.onSignIn}
              className="mt-4 inline-flex min-h-11 items-center gap-3 rounded-xl border-2 border-brand-periwinkle/30 bg-brand-white px-4 py-2.5 text-sm font-semibold text-brand-accent shadow-sm hover:shadow-md transition-all active:scale-95 dark:bg-gray-900 dark:text-brand-periwinkle"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </section>
        )}

        {!hasCompletedToday && (
          <section
            aria-label="Today incomplete"
            className="rounded-2xl border-2 border-brand-periwinkle/20 bg-brand-white/80 backdrop-blur-sm p-5 shadow-sm dark:bg-gray-800/80"
          >
            <p className="text-sm font-display font-semibold text-brand-ink dark:text-brand-white">
              Today&apos;s reflection is still open.
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Finish it when you are ready. Your synced summary will update after saving.
            </p>
            <Link
              href="/today"
              className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-brand-accent px-5 text-sm font-semibold text-white shadow-lg shadow-brand-accent/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Finish today&apos;s reflection
            </Link>
          </section>
        )}

        <section aria-label="Summary statistics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border-2 border-brand-periwinkle/10 bg-brand-white/70 p-4 shadow-sm dark:bg-gray-800/60">
            <p className="text-[10px] font-mono-brand font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Today&apos;s total</p>
            <p className="mt-1 font-mono-brand text-4xl font-bold tabular-nums text-brand-accent">
              {statStrip.todayTotal === null ? "—" : statStrip.todayTotal}
            </p>
            <p className="mt-1 text-[11px] text-gray-500 font-body">Range −20 to 100</p>
          </div>
          <div className="rounded-2xl border-2 border-brand-periwinkle/10 bg-brand-white/70 p-4 shadow-sm dark:bg-gray-800/60">
            <p className="text-[10px] font-mono-brand font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Current streak</p>
            <p className="mt-1 font-mono-brand text-4xl font-bold tabular-nums text-brand-ink dark:text-brand-white">
              {statStrip.streak}
              <span className="ml-1 text-base font-display font-semibold text-gray-500 dark:text-gray-400">days</span>
            </p>
            <p className="mt-1 text-[11px] text-gray-500 font-body">Consecutive days with an entry</p>
          </div>
          <div className="rounded-2xl border-2 border-brand-periwinkle/10 bg-brand-white/70 p-4 shadow-sm dark:bg-gray-800/60">
            <p className="text-[10px] font-mono-brand font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">7-day average</p>
            <p className="mt-1 font-mono-brand text-4xl font-bold tabular-nums text-brand-ink dark:text-brand-white">
              {statStrip.weekAverage === null ? "—" : statStrip.weekAverage.toFixed(1)}
            </p>
            <p className="mt-1 text-[11px] text-gray-500 font-body">
              From {statStrip.weekDaysWithData} day{statStrip.weekDaysWithData === 1 ? "" : "s"} in the last week
            </p>
          </div>
          <div className="rounded-2xl border-2 border-brand-periwinkle/10 bg-brand-white/70 p-4 shadow-sm dark:bg-gray-800/60">
            <p className="text-[10px] font-mono-brand font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Days logged</p>
            <p className="mt-1 font-mono-brand text-4xl font-bold tabular-nums text-brand-ink dark:text-brand-white">
              {statStrip.daysLogged}
            </p>
            <p className="mt-1 text-[11px] text-gray-500 font-body">{statStrip.dataSourceLabel}</p>
          </div>
        </section>

        <section
          aria-label="Activity chart"
          className="flex flex-col items-center rounded-2xl border-2 border-brand-periwinkle/10 bg-brand-white/70 p-6 shadow-sm dark:bg-gray-800/60"
        >
          <div className="flex w-full flex-col items-center gap-1 text-center">
            <h2 className="text-xl font-display font-bold text-brand-ink dark:text-brand-white">Activity</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Recent saved reflection totals</p>
            <ActivityIntensityLegend />
          </div>
          <div className="mt-6 flex w-full justify-center overflow-x-auto pb-1">
            <div
              className="grid grid-flow-col grid-rows-7 gap-1.5"
              aria-label="Daily reflection activity"
            >
              {activityDays.map((day) => (
                <span
                  key={day.dateKey}
                  aria-label={day.label}
                  title={day.label}
                  className={`h-3.5 w-3.5 rounded-[3px] transition-transform hover:scale-125 ${activityLevelClass[day.level]}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section aria-label="Score kanban" className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-display font-bold text-brand-ink dark:text-brand-white" aria-live="polite">
                {kanbanTitle}
              </h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Cards sort into columns by how strong each area is that day (relative to its max).
              </p>
            </div>
            {kanbanDayNavigation && (
              <div className="flex shrink-0 items-center gap-2 self-start sm:self-end">
                <button
                  type="button"
                  onClick={kanbanDayNavigation.onPreviousDay}
                  disabled={!kanbanDayNavigation.canGoPrevious}
                  className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border-2 border-brand-periwinkle/30 bg-brand-white text-xl text-brand-accent shadow-sm transition-all hover:border-brand-periwinkle/60 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-gray-800 dark:text-brand-periwinkle"
                  aria-label="View previous day"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={kanbanDayNavigation.onNextDay}
                  disabled={!kanbanDayNavigation.canGoNext}
                  className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border-2 border-brand-periwinkle/30 bg-brand-white text-xl text-brand-accent shadow-sm transition-all hover:border-brand-periwinkle/60 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-gray-800 dark:text-brand-periwinkle"
                  aria-label="View next day"
                >
                  ›
                </button>
              </div>
            )}
          </div>

          <div
            className="flex flex-col gap-4 touch-pan-y"
            onTouchStart={kanbanDayNavigation ? onKanbanTouchStart : undefined}
            onTouchEnd={kanbanDayNavigation ? onKanbanTouchEnd : undefined}
            onTouchCancel={kanbanDayNavigation ? onKanbanTouchCancel : undefined}
          >
            {kanbanDayNavigation && (
              <p className="text-[10px] uppercase font-mono-brand tracking-widest text-gray-500 dark:text-gray-400 sm:hidden">
                Swipe left for an earlier day, swipe right for a later day.
              </p>
            )}

            {cards.length === 0 ? (
              <div className="rounded-2xl border-2 border-brand-periwinkle/10 bg-brand-white/70 p-8 text-center text-sm text-gray-600 shadow-sm dark:bg-gray-800/60 dark:text-gray-300">
                <p className="font-display font-medium text-lg">{kanbanEmptyMessage}</p>
              </div>
            ) : (
              <div className="grid flex-1 gap-6 lg:grid-cols-3">
                {COLUMNS.map((col) => (
                  <div
                    key={col.id}
                    className={`flex min-h-[15rem] flex-col rounded-3xl border-2 p-4 ${col.accent} backdrop-blur-sm transition-shadow hover:shadow-md`}
                  >
                    <div className="mb-4 border-b border-black/5 pb-3">
                      <h3 className="text-base font-display font-bold text-brand-ink dark:text-brand-white">{col.title}</h3>
                      <p className="text-xs text-gray-600/80 dark:text-gray-400">{col.subtitle}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      {grouped[col.id].length === 0 ? (
                        <p className="text-xs font-medium text-gray-500/60 italic">Nothing in this column.</p>
                      ) : (
                        grouped[col.id].map((card) => <KanbanCard key={card.id} card={card} />)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="mt-12 border-t-2 border-brand-periwinkle/10 pt-8 pb-4">
          <h2 className="text-[10px] font-mono-brand font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Legal
          </h2>
          <nav aria-label="Legal and contact" className="mt-4">
            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-gray-700 dark:text-gray-300">
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
