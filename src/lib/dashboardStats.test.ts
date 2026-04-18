import { describe, expect, it } from "vitest";
import {
  buildActivityDays,
  buildCategoryCards,
  buildDashboardStatStrip,
  computeCurrentStreak,
  type EntryScores,
} from "./dashboardStats";

const entry = (totalish: Partial<EntryScores> = {}): EntryScores => ({
  prayers: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  dhikrQuran: 0,
  ibadat: 0,
  kindness: 0,
  learning: 0,
  tongueDistractions: 0,
  heart: 0,
  ...totalish,
});

describe("buildActivityDays", () => {
  it("builds a fixed day range ending on today", () => {
    const days = buildActivityDays("2026-04-15", new Map(), 2);

    expect(days).toHaveLength(14);
    expect(days[0].dateKey).toBe("2026-04-02");
    expect(days.at(-1)?.dateKey).toBe("2026-04-15");
  });

  it("distinguishes missing days from saved zero-score days", () => {
    const entries = new Map<string, EntryScores>([
      ["2026-04-14", entry()],
      [
        "2026-04-15",
        entry({
          prayers: { fajr: 2, dhuhr: 2, asr: 2, maghrib: 2, isha: 2 },
          dhikrQuran: 10,
          ibadat: 10,
          kindness: 20,
          learning: 10,
          tongueDistractions: 20,
          heart: 20,
        }),
      ],
    ]);

    const days = buildActivityDays("2026-04-15", entries, 1);

    expect(days.find((day) => day.dateKey === "2026-04-13")).toMatchObject({
      total: null,
      level: 0,
      label: "2026-04-13: no entry",
    });
    expect(days.find((day) => day.dateKey === "2026-04-14")).toMatchObject({
      total: 0,
      level: 1,
      label: "2026-04-14: 0 points",
    });
    expect(days.find((day) => day.dateKey === "2026-04-15")).toMatchObject({
      total: 100,
      level: 4,
      label: "2026-04-15: 100 points",
    });
  });
});

describe("buildCategoryCards", () => {
  it("carries reflection notes onto their matching category cards", () => {
    const cards = buildCategoryCards(
      entry({
        dhikrQuran: 8,
        notes: { dhikrQuran: "Focused recitation after Fajr." },
      }),
    );

    expect(cards.find((card) => card.id === "dhikrQuran")).toMatchObject({
      note: "Focused recitation after Fajr.",
    });
  });
});

describe("buildDashboardStatStrip", () => {
  it("counts unique entry dates once for streaks and days logged", () => {
    const entries = new Map<string, EntryScores>([
      ["2026-04-13", entry({ heart: 10 })],
      ["2026-04-14", entry({ heart: 15 })],
      ["2026-04-15", entry({ heart: 20 })],
    ]);
    entries.set("2026-04-15", entry({ heart: 20 }));

    expect(
      buildDashboardStatStrip("2026-04-15", entries, entries.get("2026-04-15") ?? null, "Synced"),
    ).toMatchObject({
      streak: 3,
      daysLogged: 3,
      todayTotal: 20,
      dataSourceLabel: "Synced",
    });
  });

  it("does not count completion-only days without a saved entry", () => {
    const entries = new Map<string, EntryScores>([
      ["2026-04-13", entry({ heart: 10 })],
      ["2026-04-14", entry({ heart: 10 })],
    ]);

    expect(buildDashboardStatStrip("2026-04-15", entries, null, "Synced")).toMatchObject({
      streak: 0,
      daysLogged: 2,
      todayTotal: null,
    });
  });
});

describe("computeCurrentStreak", () => {
  it("stops at the first missing date", () => {
    expect(computeCurrentStreak("2026-04-15", new Set(["2026-04-15", "2026-04-13"]))).toBe(1);
  });
});
