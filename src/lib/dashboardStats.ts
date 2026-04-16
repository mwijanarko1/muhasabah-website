import {
  computeTotal,
  normalizePrayerNotYetTime,
  prayerApplicableMaxPoints,
  prayerSum,
  type PrayerNotYetTime,
} from "../../convex/helpers";

/** Same shape as a stored muhasabah row’s score fields. */
export type EntryScores = {
  prayers: {
    fajr: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
  /** When set, marks salah not entered yet — omitted from prayer subtotal. */
  prayerNotYetTime?: PrayerNotYetTime;
  dhikrQuran: number;
  ibadat: number;
  kindness: number;
  learning: number;
  tongueDistractions: number;
  heart: number;
};

export type KanbanColumnId = "care" | "steady" | "thrive";

export type CategoryCardModel = {
  id: string;
  label: string;
  shortLabel: string;
  value: number;
  display: string;
  maxLabel: string;
  percent: number;
  column: KanbanColumnId;
};

export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

export type ActivityDayModel = {
  dateKey: string;
  total: number | null;
  level: ActivityLevel;
  label: string;
};

export type DashboardStatStripModel = {
  todayTotal: number | null;
  streak: number;
  weekAverage: number | null;
  weekDaysWithData: number;
  daysLogged: number;
  dataSourceLabel: string;
};

function addDaysLocal(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** 0 = needs care, 1 = steady, 2 = thriving (by percent of range). */
function bucketPercent(percent: number): KanbanColumnId {
  if (percent < 40) return "care";
  if (percent < 70) return "steady";
  return "thrive";
}

/** Unipolar 0..max → percent of max. */
function percentUnipolar(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
}

/** Tongue: −20..+20, higher is better → 0..100 */
function percentTongue(value: number): number {
  return Math.min(100, Math.max(0, ((value + 20) / 40) * 100));
}

export function buildCategoryCards(entry: EntryScores): CategoryCardModel[] {
  const notYet = normalizePrayerNotYetTime(entry.prayerNotYetTime);
  const prayer = prayerSum(entry.prayers, notYet);
  const prayerMax = prayerApplicableMaxPoints(notYet);
  const rows: Omit<CategoryCardModel, "column">[] = [
    {
      id: "prayers",
      label: "Prayers (Salah)",
      shortLabel: "Prayers",
      value: prayer,
      display: `${prayer}/${prayerMax}`,
      maxLabel: `out of ${prayerMax}`,
      percent: percentUnipolar(prayer, prayerMax),
    },
    {
      id: "dhikrQuran",
      label: "Dhikr & Quran",
      shortLabel: "Dhikr & Quran",
      value: entry.dhikrQuran,
      display: `${entry.dhikrQuran}/10`,
      maxLabel: "out of 10",
      percent: percentUnipolar(entry.dhikrQuran, 10),
    },
    {
      id: "ibadat",
      label: "Other worship (Ibadat)",
      shortLabel: "Ibadat",
      value: entry.ibadat,
      display: `${entry.ibadat}/10`,
      maxLabel: "out of 10",
      percent: percentUnipolar(entry.ibadat, 10),
    },
    {
      id: "kindness",
      label: "Kindness & character",
      shortLabel: "Kindness",
      value: entry.kindness,
      display: `${entry.kindness}/20`,
      maxLabel: "out of 20",
      percent: percentUnipolar(entry.kindness, 20),
    },
    {
      id: "learning",
      label: "Learning & growth",
      shortLabel: "Learning",
      value: entry.learning,
      display: `${entry.learning}/10`,
      maxLabel: "out of 10",
      percent: percentUnipolar(entry.learning, 10),
    },
    {
      id: "tongue",
      label: "Tongue & distractions",
      shortLabel: "Tongue",
      value: entry.tongueDistractions,
      display: entry.tongueDistractions > 0 ? `+${entry.tongueDistractions}` : `${entry.tongueDistractions}`,
      maxLabel: "−20 to +20",
      percent: percentTongue(entry.tongueDistractions),
    },
    {
      id: "heart",
      label: "Heart & intention",
      shortLabel: "Heart",
      value: entry.heart,
      display: `${entry.heart}/20`,
      maxLabel: "out of 20",
      percent: percentUnipolar(entry.heart, 20),
    },
  ];

  return rows.map((r) => ({
    ...r,
    column: bucketPercent(r.percent),
  }));
}

export function totalForEntry(entry: EntryScores): number {
  const notYet = normalizePrayerNotYetTime(entry.prayerNotYetTime);
  return computeTotal(
    entry.prayers,
    entry.dhikrQuran,
    entry.ibadat,
    entry.kindness,
    entry.learning,
    entry.tongueDistractions,
    entry.heart,
    notYet,
  );
}

function activityLevelForTotal(total: number | null): ActivityLevel {
  if (total === null) return 0;
  if (total <= 0) return 1;
  if (total <= 33) return 2;
  if (total <= 66) return 3;
  return 4;
}

export function buildActivityDays(
  todayKey: string,
  entriesByDate: Map<string, EntryScores>,
  weeks: number,
): ActivityDayModel[] {
  const dayCount = Math.max(1, Math.floor(weeks) * 7);
  const days: ActivityDayModel[] = [];

  for (let i = dayCount - 1; i >= 0; i--) {
    const dateKey = addDaysLocal(todayKey, -i);
    const entry = entriesByDate.get(dateKey);
    const total = entry ? totalForEntry(entry) : null;
    days.push({
      dateKey,
      total,
      level: activityLevelForTotal(total),
      label: total === null ? `${dateKey}: no entry` : `${dateKey}: ${total} points`,
    });
  }

  return days;
}

export function computeCurrentStreak(todayKey: string, dateKeys: Set<string>): number {
  let streak = 0;
  let key = todayKey;
  for (;;) {
    if (!dateKeys.has(key)) break;
    streak += 1;
    key = addDaysLocal(key, -1);
  }
  return streak;
}

export function averageLastNDays(
  todayKey: string,
  entriesByDate: Map<string, EntryScores>,
  windowDays: number,
): { average: number | null; daysWithData: number } {
  let sum = 0;
  let daysWithData = 0;
  for (let i = 0; i < windowDays; i++) {
    const key = addDaysLocal(todayKey, -i);
    const e = entriesByDate.get(key);
    if (e) {
      sum += totalForEntry(e);
      daysWithData += 1;
    }
  }
  if (daysWithData === 0) return { average: null, daysWithData: 0 };
  return { average: sum / daysWithData, daysWithData };
}

export function buildDashboardStatStrip(
  todayKey: string,
  entriesByDate: Map<string, EntryScores>,
  entryForToday: EntryScores | null,
  dataSourceLabel: string,
): DashboardStatStripModel {
  const { average, daysWithData } = averageLastNDays(todayKey, entriesByDate, 7);
  const entryDateKeys = new Set(entriesByDate.keys());

  return {
    todayTotal: entryForToday ? totalForEntry(entryForToday) : null,
    streak: computeCurrentStreak(todayKey, entryDateKeys),
    weekAverage: average,
    weekDaysWithData: daysWithData,
    daysLogged: entryDateKeys.size,
    dataSourceLabel,
  };
}
