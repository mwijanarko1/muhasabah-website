import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("/llms/*.md", () => {
  it("returns Markdown companions as noindex, follow documents", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://example.com";

    const response = await GET(
      new Request("https://example.com/llms/home.md"),
      { params: Promise.resolve({ document: "home.md" }) },
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, follow");
    expect(body).toContain("Canonical page: https://example.com/");
  });

  it("returns 404 for unknown Markdown companions", async () => {
    const response = await GET(
      new Request("https://example.com/llms/missing.md"),
      { params: Promise.resolve({ document: "missing.md" }) },
    );

    expect(response.status).toBe(404);
  });
});
