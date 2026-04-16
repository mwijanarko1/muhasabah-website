import type { PrayerNotYetTime } from "../../../convex/helpers";

export type PrayerScores = {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
};

export type EntryState = {
  prayers: PrayerScores;
  prayerNotYetTime: PrayerNotYetTime;
  dhikrQuran: number;
  ibadat: number;
  kindness: number;
  learning: number;
  tongueDistractions: number;
  heart: number;
  notes: {
    dhikrQuran?: string;
    ibadat?: string;
    kindness?: string;
    learning?: string;
    tongue?: string;
    heart?: string;
  };
};
