import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  isValidDateKey,
  validateEntryScores,
  prayerScores,
  truncateNotes,
  normalizePrayerNotYetTime,
  sanitizePrayersForNotYet,
  prayerNotYetTimeValidator,
} from "./helpers";

export const upsertDay = mutation({
  args: {
    dateKey: v.string(),
    prayers: prayerScores,
    prayerNotYetTime: v.optional(prayerNotYetTimeValidator),
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (!isValidDateKey(args.dateKey)) {
      throw new Error("Invalid dateKey format. Expected YYYY-MM-DD");
    }

    const prayerNotYetTime = normalizePrayerNotYetTime(args.prayerNotYetTime);
    const prayers = sanitizePrayersForNotYet(args.prayers, prayerNotYetTime);

    const validation = validateEntryScores({
      prayers,
      prayerNotYetTime,
      dhikrQuran: args.dhikrQuran,
      ibadat: args.ibadat,
      kindness: args.kindness,
      learning: args.learning,
      tongueDistractions: args.tongueDistractions,
      heart: args.heart,
    });

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const notes = truncateNotes(args.notes);

    const existing = await ctx.db
      .query("muhasabahEntries")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("dateKey", args.dateKey))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        prayers,
        prayerNotYetTime,
        dhikrQuran: args.dhikrQuran,
        ibadat: args.ibadat,
        kindness: args.kindness,
        learning: args.learning,
        tongueDistractions: args.tongueDistractions,
        heart: args.heart,
        notes,
        updatedAt: now,
      });
      return existing._id;
    } else {
      const id = await ctx.db.insert("muhasabahEntries", {
        userId,
        dateKey: args.dateKey,
        prayers,
        prayerNotYetTime,
        dhikrQuran: args.dhikrQuran,
        ibadat: args.ibadat,
        kindness: args.kindness,
        learning: args.learning,
        tongueDistractions: args.tongueDistractions,
        heart: args.heart,
        notes,
        updatedAt: now,
      });
      return id;
    }
  },
});

export const markSessionComplete = mutation({
  args: {
    dateKey: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (!isValidDateKey(args.dateKey)) {
      throw new Error("Invalid dateKey format. Expected YYYY-MM-DD");
    }

    const now = Date.now();
    const existing = await ctx.db
      .query("sessionCompletions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("dateKey", args.dateKey))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { completedAt: now });
      return existing._id;
    }

    return await ctx.db.insert("sessionCompletions", {
      userId,
      dateKey: args.dateKey,
      completedAt: now,
    });
  },
});

export const upsertUserSettings = mutation({
  args: {
    ianaTimezone: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ianaTimezone: args.ianaTimezone,
        updatedAt: now,
      });
      return existing._id;
    } else {
      const id = await ctx.db.insert("userSettings", {
        userId,
        ianaTimezone: args.ianaTimezone,
        updatedAt: now,
      });
      return id;
    }
  },
});
