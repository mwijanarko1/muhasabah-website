import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("lists only canonical indexable public routes", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://example.com";

    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toEqual([
      "https://example.com/",
      "https://example.com/privacy",
      "https://example.com/terms",
    ]);
    expect(urls.some((url) => url.includes("/dashboard"))).toBe(false);
    expect(urls.some((url) => url.includes("/today"))).toBe(false);
    expect(urls.some((url) => url.includes("/llms/"))).toBe(false);
  });
});
