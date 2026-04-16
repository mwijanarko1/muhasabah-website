import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const score012 = v.union(v.literal(0), v.literal(1), v.literal(2));

export default defineSchema({
  ...authTables,

  userSettings: defineTable({
    userId: v.string(),
    ianaTimezone: v.string(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  /** One row per user per calendar day when they finish the slideshow session. */
  sessionCompletions: defineTable({
    userId: v.string(),
    dateKey: v.string(),
    completedAt: v.number(),
  }).index("by_user_and_date", ["userId", "dateKey"]),

  muhasabahEntries: defineTable({
    userId: v.string(),
    dateKey: v.string(),
    prayers: v.object({
      fajr: score012,
      dhuhr: score012,
      asr: score012,
      maghrib: score012,
      isha: score012,
    }),
    /** Salah not entered yet — excluded from prayer points (optional for legacy rows). */
    prayerNotYetTime: v.optional(
      v.object({
        fajr: v.boolean(),
        dhuhr: v.boolean(),
        asr: v.boolean(),
        maghrib: v.boolean(),
        isha: v.boolean(),
      }),
    ),
    dhikrQuran: v.number(),
    ibadat: v.number(),
    kindness: v.number(),
    learning: v.number(),
    tongueDistractions: v.number(),
    heart: v.number(),
    notes: v.optional(
      v.object({
        dhikrQuran: v.optional(v.string()),
        ibadat: v.optional(v.string()),
        kindness: v.optional(v.string()),
        learning: v.optional(v.string()),
        tongue: v.optional(v.string()),
        heart: v.optional(v.string()),
      }),
    ),
    updatedAt: v.number(),
  }).index("by_user_and_date", ["userId", "dateKey"]),
});
