import { describe, expect, it, vi } from "vitest";
import { fetchMuhasabahApi } from "./muhasabahApiClient";

describe("fetchMuhasabahApi", () => {
  it("sends Firebase ID tokens as bearer credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { ok: true } }),
    });

    const data = await fetchMuhasabahApi<{ ok: boolean }>("/api/muhasabah/settings", {
      getIdToken: async () => "firebase-id-token",
      fetchImpl: fetchMock,
    });

    expect(data).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/muhasabah/settings",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer firebase-id-token",
        }),
      }),
    );
  });

  it("does not call the API without a Firebase ID token", async () => {
    const fetchMock = vi.fn();

    await expect(
      fetchMuhasabahApi("/api/muhasabah/settings", {
        getIdToken: async () => null,
        fetchImpl: fetchMock,
      }),
    ).rejects.toThrow("Sign in before syncing your journal.");

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
