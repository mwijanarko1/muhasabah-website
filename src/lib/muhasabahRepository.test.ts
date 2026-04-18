import { beforeEach, describe, expect, it, vi } from "vitest";
import { upsertDay } from "./muhasabahRepository";
import type { MuhasabahEntryInput } from "./muhasabahTypes";

const mocks = vi.hoisted(() => ({
  set: vi.fn(),
}));

vi.mock("./firebase/admin", () => ({
  getFirebaseAdminDb: () => ({
    collection: () => ({
      doc: () => ({
        collection: () => ({
          doc: () => ({
            set: mocks.set,
          }),
        }),
      }),
    }),
  }),
}));

const entryWithoutNotes: MuhasabahEntryInput = {
  dateKey: "2026-04-18",
  prayers: { fajr: 2, dhuhr: 2, asr: 2, maghrib: 2, isha: 2 },
  prayerNotYetTime: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false },
  dhikrQuran: 0,
  ibadat: 0,
  kindness: 0,
  learning: 0,
  tongueDistractions: 0,
  heart: 0,
};

describe("muhasabahRepository", () => {
  beforeEach(() => {
    mocks.set.mockReset();
    mocks.set.mockResolvedValue(undefined);
  });

  it("omits undefined optional fields before writing a Firestore document", async () => {
    await upsertDay("user-1", { ...entryWithoutNotes, notes: undefined });

    expect(mocks.set).toHaveBeenCalledTimes(1);
    const [data] = mocks.set.mock.calls[0];
    expect(Object.prototype.hasOwnProperty.call(data, "notes")).toBe(false);
  });

  it("keeps notes when they are present", async () => {
    await upsertDay("user-1", {
      ...entryWithoutNotes,
      notes: { heart: "Focused" },
    });

    const [data] = mocks.set.mock.calls[0];
    expect(data.notes).toEqual({ heart: "Focused" });
  });
});
