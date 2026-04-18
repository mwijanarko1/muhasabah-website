import type { NotesFields, PrayerNotYetTime } from "./muhasabahScoring";

export type PrayerScore = 0 | 1 | 2;

export type PrayerScores = {
  fajr: PrayerScore;
  dhuhr: PrayerScore;
  asr: PrayerScore;
  maghrib: PrayerScore;
  isha: PrayerScore;
};

export type MuhasabahEntryInput = {
  dateKey: string;
  prayers: PrayerScores;
  prayerNotYetTime: PrayerNotYetTime;
  dhikrQuran: number;
  ibadat: number;
  kindness: number;
  learning: number;
  tongueDistractions: number;
  heart: number;
  notes?: NotesFields;
};

export type MuhasabahEntry = MuhasabahEntryInput & {
  updatedAt: number;
};

export type UserSettings = {
  ianaTimezone: string;
  updatedAt: number;
};
