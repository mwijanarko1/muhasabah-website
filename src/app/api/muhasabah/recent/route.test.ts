import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listRecent: vi.fn(),
  requireFirebaseUser: vi.fn(),
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
  listRecent: mocks.listRecent,
}));

async function getRecent(path: string) {
  const { GET } = await import("./route");
  return GET(
    new Request(`https://example.com${path}`, {
      headers: { Authorization: "Bearer token" },
    }),
  );
}

describe("muhasabah recent API route", () => {
  beforeEach(() => {
    mocks.listRecent.mockReset();
    mocks.listRecent.mockResolvedValue([]);
    mocks.requireFirebaseUser.mockReset();
    mocks.requireFirebaseUser.mockResolvedValue({ uid: "user-1" });
  });

  it("rejects malformed limit query values before reading Firestore", async () => {
    const response = await getRecent("/api/muhasabah/recent?limit=banana");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: { code: "VALIDATION_ERROR", message: "Use a limit from 1 to 100." },
    });
    expect(mocks.listRecent).not.toHaveBeenCalled();
  });

  it("rejects unexpected query parameters before reading Firestore", async () => {
    const response = await getRecent("/api/muhasabah/recent?limit=5&sort=asc");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: { code: "VALIDATION_ERROR", message: "Use only supported query parameters." },
    });
    expect(mocks.listRecent).not.toHaveBeenCalled();
  });
});
