import {
  CloudSun,
  MoonStars,
  Sun,
  SunDim,
  SunHorizon,
} from "@phosphor-icons/react";
import { defaultPrayerNotYetTime } from "@/lib/muhasabahScoring";
import type { EntryState } from "./types";

/** 0–6 = seven sections, 7 = congratulations / next steps */
export const OUTRO_SLIDE = 7;

export const PRAYER_ICONS = {
  fajr: SunHorizon,
  dhuhr: Sun,
  asr: SunDim,
  maghrib: CloudSun,
  isha: MoonStars,
} as const;

export const defaultEntry: EntryState = {
  prayers: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  prayerNotYetTime: { ...defaultPrayerNotYetTime },
  dhikrQuran: 0,
  ibadat: 0,
  kindness: 0,
  learning: 0,
  tongueDistractions: 0,
  heart: 0,
  notes: {},
};
