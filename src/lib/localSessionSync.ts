import { clamp, normalizePrayerNotYetTime, type PrayerNotYetTime } from "../../convex/helpers";
import type { LocalDraftShape } from "./muhasabahLocalDraft";

type PrayerScore = 0 | 1 | 2;

type LocalDraftUpsertArgs = {
  dateKey: string;
  prayers: {
    fajr: PrayerScore;
    dhuhr: PrayerScore;
    asr: PrayerScore;
    maghrib: PrayerScore;
    isha: PrayerScore;
  };
  prayerNotYetTime: PrayerNotYetTime;
  dhikrQuran: number;
  ibadat: number;
  kindness: number;
  learning: number;
  tongueDistractions: number;
  heart: number;
  notes?: LocalDraftShape["notes"];
};

const NOTE_KEYS = ["dhikrQuran", "ibadat", "kindness", "learning", "tongue", "heart"] as const;

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return clamp(Math.round(value), min, max);
}

function clampPrayerScore(value: number): PrayerScore {
  return clampInteger(value, 0, 2) as PrayerScore;
}

function cleanNotes(notes: LocalDraftShape["notes"] | undefined): LocalDraftShape["notes"] | undefined {
  if (!notes) return undefined;
  const cleaned: LocalDraftShape["notes"] = {};
  for (const key of NOTE_KEYS) {
    const value = notes[key];
    if (typeof value === "string") {
      cleaned[key] = value;
    }
  }
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

export function buildLocalDraftUpsertArgs(
  dateKey: string,
  draft: LocalDraftShape,
): LocalDraftUpsertArgs {
  const prayerNotYetTime = normalizePrayerNotYetTime(draft.prayerNotYetTime);
  return {
    dateKey,
    prayers: {
      fajr: clampPrayerScore(draft.prayers.fajr),
      dhuhr: clampPrayerScore(draft.prayers.dhuhr),
      asr: clampPrayerScore(draft.prayers.asr),
      maghrib: clampPrayerScore(draft.prayers.maghrib),
      isha: clampPrayerScore(draft.prayers.isha),
    },
    prayerNotYetTime,
    dhikrQuran: clampInteger(draft.dhikrQuran, 0, 10),
    ibadat: clampInteger(draft.ibadat, 0, 10),
    kindness: clampInteger(draft.kindness, 0, 20),
    learning: clampInteger(draft.learning, 0, 10),
    tongueDistractions: clampInteger(draft.tongueDistractions, -20, 20),
    heart: clampInteger(draft.heart, 0, 20),
    notes: cleanNotes(draft.notes),
  };
}
