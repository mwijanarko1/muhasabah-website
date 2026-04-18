import { describe, expect, it } from "vitest";
import robots from "./robots";

describe("robots", () => {
  it("allows public pages, blocks only API crawl waste, and advertises the sitemap", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://example.com";

    const body = robots();

    expect(body.rules).toEqual({
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    });
    expect(body.sitemap).toBe("https://example.com/sitemap.xml");
  });
});
