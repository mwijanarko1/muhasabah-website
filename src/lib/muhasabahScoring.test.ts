import { describe, it, expect } from "vitest";
import {
  prayerSum,
  computeTotal,
  validateEntryScores,
  isValidDateKey,
  clamp,
  truncateNotes,
  NOTE_FIELD_MAX_CHARS,
  normalizePrayerNotYetTime,
} from "@/lib/muhasabahScoring";

describe("Muhasabah helpers", () => {
  describe("prayerSum", () => {
    it("returns 0 when all prayers are 0", () => {
      expect(
        prayerSum({ fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }),
      ).toBe(0);
    });

    it("returns 10 when all prayers are 2", () => {
      expect(
        prayerSum({ fajr: 2, dhuhr: 2, asr: 2, maghrib: 2, isha: 2 }),
      ).toBe(10);
    });

    it("sums mixed values correctly", () => {
      expect(
        prayerSum({ fajr: 2, dhuhr: 1, asr: 0, maghrib: 2, isha: 1 }),
      ).toBe(6);
    });

    it("excludes prayers marked not time yet", () => {
      const notYet = normalizePrayerNotYetTime({ maghrib: true, isha: true });
      expect(
        prayerSum({ fajr: 2, dhuhr: 2, asr: 2, maghrib: 0, isha: 0 }, notYet),
      ).toBe(6);
    });
  });

  describe("computeTotal", () => {
    it("returns minimum -20 when all scores are 0 and tongue is -20", () => {
      const total = computeTotal(
        { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
        0, // dhikrQuran
        0, // ibadat
        0, // kindness
        0, // learning
        -20, // tongueDistractions
        0, // heart
      );
      expect(total).toBe(-20);
    });

    it("returns maximum 100 when all scores are max", () => {
      const total = computeTotal(
        { fajr: 2, dhuhr: 2, asr: 2, maghrib: 2, isha: 2 },
        10, // dhikrQuran
        10, // ibadat
        20, // kindness
        10, // learning
        20, // tongueDistractions
        20, // heart
      );
      expect(total).toBe(100);
    });

    it("uses a lower prayer cap when maghrib and isha are not time yet", () => {
      const notYet = normalizePrayerNotYetTime({ maghrib: true, isha: true });
      const total = computeTotal(
        { fajr: 2, dhuhr: 2, asr: 2, maghrib: 0, isha: 0 },
        10,
        10,
        20,
        10,
        20,
        20,
        notYet,
      );
      expect(total).toBe(96);
    });

    it("computes a realistic mid-range score", () => {
      const total = computeTotal(
        { fajr: 2, dhuhr: 1, asr: 1, maghrib: 2, isha: 1 },
        7,
        5,
        12,
        6,
        -5,
        15,
      );
      // 7 + 7 + 5 + 12 + 6 - 5 + 15 = 47
      expect(total).toBe(47);
    });

    it("total stays within bounds for valid inputs", () => {
      const total = computeTotal(
        { fajr: 1, dhuhr: 1, asr: 1, maghrib: 1, isha: 1 },
        5,
        5,
        10,
        5,
        0,
        10,
      );
      // 5 + 5 + 5 + 10 + 5 + 0 + 10 = 40
      expect(total).toBe(40);
      expect(total).toBeGreaterThanOrEqual(-20);
      expect(total).toBeLessThanOrEqual(100);
    });
  });

  describe("validateEntryScores", () => {
    it("accepts valid scores", () => {
      const result = validateEntryScores({
        prayers: { fajr: 2, dhuhr: 1, asr: 0, maghrib: 2, isha: 1 },
        dhikrQuran: 7,
        ibadat: 5,
        kindness: 15,
        learning: 8,
        tongueDistractions: -3,
        heart: 18,
      });
      expect(result).toEqual({ valid: true });
    });

    it("rejects prayer score of 3", () => {
      const result = validateEntryScores({
        prayers: { fajr: 3, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
        dhikrQuran: 0,
        ibadat: 0,
        kindness: 0,
        learning: 0,
        tongueDistractions: 0,
        heart: 0,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("fajr");
      }
    });

    it("rejects dhikrQuran > 10", () => {
      const result = validateEntryScores({
        prayers: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
        dhikrQuran: 11,
        ibadat: 0,
        kindness: 0,
        learning: 0,
        tongueDistractions: 0,
        heart: 0,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("dhikrQuran");
      }
    });

    it("rejects kindness > 20", () => {
      const result = validateEntryScores({
        prayers: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
        dhikrQuran: 0,
        ibadat: 0,
        kindness: 21,
        learning: 0,
        tongueDistractions: 0,
        heart: 0,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("kindness");
      }
    });

    it("rejects tongueDistractions < -20", () => {
      const result = validateEntryScores({
        prayers: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
        dhikrQuran: 0,
        ibadat: 0,
        kindness: 0,
        learning: 0,
        tongueDistractions: -21,
        heart: 0,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("tongueDistractions");
      }
    });

    it("rejects heart > 20", () => {
      const result = validateEntryScores({
        prayers: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
        dhikrQuran: 0,
        ibadat: 0,
        kindness: 0,
        learning: 0,
        tongueDistractions: 0,
        heart: 21,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("heart");
      }
    });

    it("rejects non-integer dhikrQuran", () => {
      const result = validateEntryScores({
        prayers: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
        dhikrQuran: 5.5,
        ibadat: 0,
        kindness: 0,
        learning: 0,
        tongueDistractions: 0,
        heart: 0,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("integer");
      }
    });

    it("accepts boundary values", () => {
      const minResult = validateEntryScores({
        prayers: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
        dhikrQuran: 0,
        ibadat: 0,
        kindness: 0,
        learning: 0,
        tongueDistractions: -20,
        heart: 0,
      });
      expect(minResult).toEqual({ valid: true });

      const maxResult = validateEntryScores({
        prayers: { fajr: 2, dhuhr: 2, asr: 2, maghrib: 2, isha: 2 },
        dhikrQuran: 10,
        ibadat: 10,
        kindness: 20,
        learning: 10,
        tongueDistractions: 20,
        heart: 20,
      });
      expect(maxResult).toEqual({ valid: true });
    });

    it("accepts max total 96 when two prayers are not time yet", () => {
      const result = validateEntryScores({
        prayers: { fajr: 2, dhuhr: 2, asr: 2, maghrib: 0, isha: 0 },
        prayerNotYetTime: { maghrib: true, isha: true },
        dhikrQuran: 10,
        ibadat: 10,
        kindness: 20,
        learning: 10,
        tongueDistractions: 20,
        heart: 20,
      });
      expect(result).toEqual({ valid: true });
    });
  });

  describe("isValidDateKey", () => {
    it("accepts YYYY-MM-DD format", () => {
      expect(isValidDateKey("2024-01-15")).toBe(true);
      expect(isValidDateKey("2026-12-31")).toBe(true);
    });

    it("rejects invalid formats", () => {
      expect(isValidDateKey("2024/01/15")).toBe(false);
      expect(isValidDateKey("01-15-2024")).toBe(false);
      expect(isValidDateKey("2024-1-5")).toBe(false);
      expect(isValidDateKey("not-a-date")).toBe(false);
      expect(isValidDateKey("")).toBe(false);
    });
  });

  describe("truncateNotes", () => {
    it("returns undefined for empty input", () => {
      expect(truncateNotes(undefined)).toBeUndefined();
    });

    it("truncates fields longer than max", () => {
      const long = "a".repeat(NOTE_FIELD_MAX_CHARS + 10);
      const out = truncateNotes({ dhikrQuran: long });
      expect(out?.dhikrQuran?.length).toBe(NOTE_FIELD_MAX_CHARS);
    });
  });

  describe("clamp", () => {
    it("clamps value to min", () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it("clamps value to max", () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it("returns value when within bounds", () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });
  });
});
