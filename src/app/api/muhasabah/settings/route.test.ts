import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUserSettings: vi.fn(),
  requireFirebaseUser: vi.fn(),
  upsertUserSettings: vi.fn(),
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
  getUserSettings: mocks.getUserSettings,
  upsertUserSettings: mocks.upsertUserSettings,
}));

async function putSettings(payload: unknown) {
  const { PUT } = await import("./route");
  return PUT(
    new Request("https://example.com/api/muhasabah/settings", {
      body: JSON.stringify(payload),
      headers: { Authorization: "Bearer token", "Content-Type": "application/json" },
      method: "PUT",
    }),
  );
}

describe("muhasabah settings API route", () => {
  beforeEach(() => {
    mocks.getUserSettings.mockReset();
    mocks.requireFirebaseUser.mockReset();
    mocks.requireFirebaseUser.mockResolvedValue({ uid: "user-1" });
    mocks.upsertUserSettings.mockReset();
    mocks.upsertUserSettings.mockResolvedValue({ ianaTimezone: "Europe/London", updatedAt: 1 });
  });

  it("rejects non-IANA timezone settings before writing Firestore", async () => {
    const response = await putSettings({ ianaTimezone: "Mars/Base" });

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      error: { code: "VALIDATION_ERROR", message: "Use a valid IANA time zone." },
    });
    expect(mocks.upsertUserSettings).not.toHaveBeenCalled();
  });
});
