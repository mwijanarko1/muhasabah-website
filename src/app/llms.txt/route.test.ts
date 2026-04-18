import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("/llms.txt", () => {
  it("returns a text discovery document", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://example.com";

    const response = await GET();
    const body = await response.text();

    expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(body).toContain("# Muhasabah");
    expect(body).toContain("https://example.com/llms/home.md");
  });
});
