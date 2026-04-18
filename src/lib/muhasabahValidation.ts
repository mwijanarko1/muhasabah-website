import { z } from "zod";
import {
  normalizePrayerNotYetTime,
  sanitizePrayersForNotYet,
  truncateNotes,
  validateEntryScores,
} from "./muhasabahScoring";
import type { MuhasabahEntryInput } from "./muhasabahTypes";

const prayerScoreSchema = z.union([z.literal(0), z.literal(1), z.literal(2)]);

export const notesSchema = z
  .object({
    dhikrQuran: z.string().optional(),
    ibadat: z.string().optional(),
    kindness: z.string().optional(),
    learning: z.string().optional(),
    tongue: z.string().optional(),
    heart: z.string().optional(),
  })
  .strict();

function isValidIanaTimeZone(value: string): boolean {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export const entryPayloadSchema = z
  .object({
    prayers: z
      .object({
        fajr: prayerScoreSchema,
        dhuhr: prayerScoreSchema,
        asr: prayerScoreSchema,
        maghrib: prayerScoreSchema,
        isha: prayerScoreSchema,
      })
      .strict(),
    prayerNotYetTime: z
      .object({
        fajr: z.boolean(),
        dhuhr: z.boolean(),
        asr: z.boolean(),
        maghrib: z.boolean(),
        isha: z.boolean(),
      })
      .strict()
      .optional(),
    dhikrQuran: z.number().int(),
    ibadat: z.number().int(),
    kindness: z.number().int(),
    learning: z.number().int(),
    tongueDistractions: z.number().int(),
    heart: z.number().int(),
    notes: notesSchema.optional(),
  })
  .strict();

export const userSettingsPayloadSchema = z
  .object({
    ianaTimezone: z.string().min(1).max(128).refine(isValidIanaTimeZone),
  })
  .strict();

export function parseEntryPayload(dateKey: string, value: unknown): MuhasabahEntryInput {
  const parsed = entryPayloadSchema.parse(value);
  const prayerNotYetTime = normalizePrayerNotYetTime(parsed.prayerNotYetTime);
  const prayers = sanitizePrayersForNotYet(parsed.prayers, prayerNotYetTime);
  const validation = validateEntryScores({
    ...parsed,
    prayers,
    prayerNotYetTime,
  });

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return {
    dateKey,
    prayers,
    prayerNotYetTime,
    dhikrQuran: parsed.dhikrQuran,
    ibadat: parsed.ibadat,
    kindness: parsed.kindness,
    learning: parsed.learning,
    tongueDistractions: parsed.tongueDistractions,
    heart: parsed.heart,
    notes: truncateNotes(parsed.notes),
  };
}
