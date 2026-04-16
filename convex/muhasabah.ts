import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isValidDateKey } from "./helpers";

export const getDay = query({
  args: {
    dateKey: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    if (!isValidDateKey(args.dateKey)) {
      throw new Error("Invalid dateKey format. Expected YYYY-MM-DD");
    }

    const entry = await ctx.db
      .query("muhasabahEntries")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("dateKey", args.dateKey))
      .first();

    return entry;
  },
});

export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const raw = args.limit ?? 30;
    const limit = Math.min(100, Math.max(1, Math.floor(Number.isFinite(raw) ? raw : 30)));

    const entries = await ctx.db
      .query("muhasabahEntries")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return entries;
  },
});

export const getUserSettings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return settings;
  },
});

export const hasCompletedSessionForDate = query({
  args: {
    dateKey: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    if (!isValidDateKey(args.dateKey)) {
      return false;
    }

    const row = await ctx.db
      .query("sessionCompletions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("dateKey", args.dateKey))
      .first();

    return row !== null;
  },
});
