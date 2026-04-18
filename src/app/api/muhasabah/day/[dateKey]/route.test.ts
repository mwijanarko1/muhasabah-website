import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDay: vi.fn(),
  requireFirebaseUser: vi.fn(),
  upsertDay: vi.fn(),
}));

vi.mock("@/lib/firebase/serverAuth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/firebase/serverAuth")>(
    "@/lib/firebase/serverAuth",
  );
  return {
    ...actual,
    requireFirebaseUser: mocks.requireFirebaseUser,
  };
});

vi.mock("@/lib/muhasabahRepository", () => ({
  getDay: mocks.getDay,
  upsertDay: mocks.upsertDay,
}));

const validPayload = {
  prayers: { fajr: 2, dhuhr: 2, asr: 2, maghrib: 2, isha: 2 },
  prayerNotYetTime: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false },
  dhikrQuran: 8,
  ibadat: 8,
  kindness: 15,
  learning: 8,
  tongueDistractions: 5,
  heart: 16,
  notes: { heart: "Focused." },
};

async function putDay(payload: unknown) {
  const { PUT } = await import("./route");
  return PUT(
    new Request("https://example.com/api/muhasabah/day/2026-04-18", {
      body: JSON.stringify(payload),
      headers: { Authorization: "Bearer token", "Content-Type": "application/json" },
      method: "PUT",
    }),
    { params: Promise.resolve({ dateKey: "2026-04-18" }) },
  );
}

describe("muhasabah day API route", () => {
  beforeEach(() => {
    mocks.getDay.mockReset();
    mocks.requireFirebaseUser.mockReset();
    mocks.upsertDay.mockReset();
    mocks.requireFirebaseUser.mockResolvedValue({ uid: "user-1" });
    mocks.upsertDay.mockResolvedValue("2026-04-18");
  });

  it("returns validation errors for invalid journal payloads", async () => {
    const response = await putDay({ ...validPayload, dhikrQuran: 99 });

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      error: { code: "VALIDATION_ERROR", message: "dhikrQuran must be 0-10" },
    });
    expect(mocks.upsertDay).not.toHaveBeenCalled();
  });

  it("does not expose repository failures as validation errors", async () => {
    mocks.upsertDay.mockRejectedValue(new Error("Could not load the default credentials."));

    const response = await putDay(validPayload);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong." },
    });
  });
});
