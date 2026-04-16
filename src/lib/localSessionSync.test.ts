import { describe, expect, it } from "vitest";
import { defaultPrayerNotYetTime } from "../../convex/helpers";
import { buildLocalDraftUpsertArgs } from "./localSessionSync";
import type { LocalDraftShape } from "./muhasabahLocalDraft";

const draft: LocalDraftShape = {
  prayers: {
    fajr: 2,
    dhuhr: 1,
    asr: 0,
    maghrib: 2,
    isha: 1,
  },
  dhikrQuran: 7,
  ibadat: 4,
  kindness: 13,
  learning: 6,
  tongueDistractions: -3,
  heart: 15,
  notes: {
    dhikrQuran: "Read after Fajr",
    kindness: "Called family",
  },
};

describe("buildLocalDraftUpsertArgs", () => {
  it("builds Convex upsert args from a completed anonymous local draft", () => {
    expect(buildLocalDraftUpsertArgs("2026-04-15", draft)).toEqual({
      dateKey: "2026-04-15",
      prayers: {
        fajr: 2,
        dhuhr: 1,
        asr: 0,
        maghrib: 2,
        isha: 1,
      },
      prayerNotYetTime: { ...defaultPrayerNotYetTime },
      dhikrQuran: 7,
      ibadat: 4,
      kindness: 13,
      learning: 6,
      tongueDistractions: -3,
      heart: 15,
      notes: {
        dhikrQuran: "Read after Fajr",
        kindness: "Called family",
      },
    });
  });

  it("clamps tampered local scores before sending them to the trusted server mutation", () => {
    const tampered = {
      ...draft,
      prayers: { ...draft.prayers, fajr: 99 },
      dhikrQuran: 999,
      tongueDistractions: -999,
    };

    expect(buildLocalDraftUpsertArgs("2026-04-15", tampered)).toMatchObject({
      prayers: { fajr: 2 },
      prayerNotYetTime: { ...defaultPrayerNotYetTime },
      dhikrQuran: 10,
      tongueDistractions: -20,
    });
  });

  it("normalizes prayer not-yet flags from a partial draft", () => {
    const partial: LocalDraftShape = {
      ...draft,
      prayerNotYetTime: { maghrib: true, isha: true },
    };
    expect(buildLocalDraftUpsertArgs("2026-04-15", partial).prayerNotYetTime).toEqual({
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: true,
      isha: true,
    });
  });
});
