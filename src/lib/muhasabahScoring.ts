export const PRAYER_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type PrayerKey = (typeof PRAYER_KEYS)[number];

/** When true, that salah has not entered yet, so it is excluded from prayer subtotal. */
export type PrayerNotYetTime = Record<PrayerKey, boolean>;

export const defaultPrayerNotYetTime: PrayerNotYetTime = {
  fajr: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false,
};

export function normalizePrayerNotYetTime(
  value: Partial<PrayerNotYetTime> | undefined | null,
): PrayerNotYetTime {
  if (!value) return { ...defaultPrayerNotYetTime };
  return {
    fajr: Boolean(value.fajr),
    dhuhr: Boolean(value.dhuhr),
    asr: Boolean(value.asr),
    maghrib: Boolean(value.maghrib),
    isha: Boolean(value.isha),
  };
}

export function isValidDateKey(dateKey: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey);
}

export function prayerApplicableMaxPoints(notYet: PrayerNotYetTime): number {
  let max = 0;
  for (const key of PRAYER_KEYS) {
    if (!notYet[key]) max += 2;
  }
  return max;
}

export function prayerSum(
  prayers: {
    fajr: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  },
  notYet: PrayerNotYetTime = defaultPrayerNotYetTime,
): number {
  let sum = 0;
  for (const key of PRAYER_KEYS) {
    if (!notYet[key]) sum += prayers[key];
  }
  return sum;
}

export function computeTotal(
  prayers: { fajr: number; dhuhr: number; asr: number; maghrib: number; isha: number },
  dhikrQuran: number,
  ibadat: number,
  kindness: number,
  learning: number,
  tongueDistractions: number,
  heart: number,
  prayerNotYet: PrayerNotYetTime = defaultPrayerNotYetTime,
): number {
  return (
    prayerSum(prayers, prayerNotYet) +
    dhikrQuran +
    ibadat +
    kindness +
    learning +
    tongueDistractions +
    heart
  );
}

type Prayer012 = {
  fajr: 0 | 1 | 2;
  dhuhr: 0 | 1 | 2;
  asr: 0 | 1 | 2;
  maghrib: 0 | 1 | 2;
  isha: 0 | 1 | 2;
};

/** Forces stored scores to 0 for prayers marked not-yet for server-side consistency. */
export function sanitizePrayersForNotYet(prayers: Prayer012, notYet: PrayerNotYetTime): Prayer012 {
  const out = { ...prayers };
  for (const key of PRAYER_KEYS) {
    if (notYet[key]) out[key] = 0;
  }
  return out;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export const NOTE_FIELD_MAX_CHARS = 5000;

export type NotesFields = {
  dhikrQuran?: string;
  ibadat?: string;
  kindness?: string;
  learning?: string;
  tongue?: string;
  heart?: string;
};

function truncateNoteField(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (value.length <= NOTE_FIELD_MAX_CHARS) return value;
  return value.slice(0, NOTE_FIELD_MAX_CHARS);
}

export function truncateNotes(notes: NotesFields | undefined): NotesFields | undefined {
  if (!notes) return undefined;
  const out: NotesFields = {};
  const keys: (keyof NotesFields)[] = [
    "dhikrQuran",
    "ibadat",
    "kindness",
    "learning",
    "tongue",
    "heart",
  ];
  for (const key of keys) {
    const value = notes[key];
    if (value === undefined) continue;
    const truncated = truncateNoteField(value);
    if (truncated !== undefined) out[key] = truncated;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export function validateEntryScores(args: {
  prayers: { fajr: number; dhuhr: number; asr: number; maghrib: number; isha: number };
  prayerNotYetTime?: Partial<PrayerNotYetTime> | null;
  dhikrQuran: number;
  ibadat: number;
  kindness: number;
  learning: number;
  tongueDistractions: number;
  heart: number;
}): { valid: true } | { valid: false; error: string } {
  const {
    prayers,
    prayerNotYetTime: rawNotYet,
    dhikrQuran,
    ibadat,
    kindness,
    learning,
    tongueDistractions,
    heart,
  } = args;
  const prayerNotYetTime = normalizePrayerNotYetTime(rawNotYet);

  for (const key of PRAYER_KEYS) {
    const value = prayers[key];
    if (!Number.isInteger(value)) {
      return { valid: false, error: `Prayer ${key} must be a whole number` };
    }
    if (![0, 1, 2].includes(value)) {
      return { valid: false, error: `Prayer ${key} must be 0, 1, or 2` };
    }
    if (prayerNotYetTime[key] && value !== 0) {
      return { valid: false, error: `Prayer ${key} must be 0 when marked not time yet` };
    }
  }

  if (!Number.isInteger(dhikrQuran)) return { valid: false, error: "dhikrQuran must be an integer" };
  if (!Number.isInteger(ibadat)) return { valid: false, error: "ibadat must be an integer" };
  if (!Number.isInteger(kindness)) return { valid: false, error: "kindness must be an integer" };
  if (!Number.isInteger(learning)) return { valid: false, error: "learning must be an integer" };
  if (!Number.isInteger(tongueDistractions)) {
    return { valid: false, error: "tongueDistractions must be an integer" };
  }
  if (!Number.isInteger(heart)) return { valid: false, error: "heart must be an integer" };

  if (dhikrQuran < 0 || dhikrQuran > 10) return { valid: false, error: "dhikrQuran must be 0-10" };
  if (ibadat < 0 || ibadat > 10) return { valid: false, error: "ibadat must be 0-10" };
  if (kindness < 0 || kindness > 20) return { valid: false, error: "kindness must be 0-20" };
  if (learning < 0 || learning > 10) return { valid: false, error: "learning must be 0-10" };
  if (tongueDistractions < -20 || tongueDistractions > 20) {
    return { valid: false, error: "tongueDistractions must be -20 to 20" };
  }
  if (heart < 0 || heart > 20) return { valid: false, error: "heart must be 0-20" };

  const maxPrayerPoints = prayerApplicableMaxPoints(prayerNotYetTime);
  const maxTotalAllowed = 90 + maxPrayerPoints;
  const total = computeTotal(
    prayers,
    dhikrQuran,
    ibadat,
    kindness,
    learning,
    tongueDistractions,
    heart,
    prayerNotYetTime,
  );
  if (total < -20 || total > maxTotalAllowed) {
    return { valid: false, error: `Total score must be between -20 and ${maxTotalAllowed}` };
  }

  return { valid: true };
}
