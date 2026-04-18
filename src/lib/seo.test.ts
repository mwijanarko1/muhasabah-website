import { afterEach, describe, expect, it } from "vitest";
import {
  buildAbsoluteUrl,
  buildLlmsMarkdown,
  buildLlmsTxt,
  getIndexablePages,
  getLlmsDocumentByPath,
  getSiteUrl,
} from "./seo";

const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
const originalVercelProjectProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const originalVercelUrl = process.env.VERCEL_URL;

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
}

afterEach(() => {
  restoreEnv("NEXT_PUBLIC_APP_URL", originalAppUrl);
  restoreEnv("VERCEL_PROJECT_PRODUCTION_URL", originalVercelProjectProductionUrl);
  restoreEnv("VERCEL_URL", originalVercelUrl);
});

describe("SEO helpers", () => {
  it("uses the production Vercel domain when no app origin is configured", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;

    expect(getSiteUrl()).toBe("https://muhasabah-omega.vercel.app");
  });

  it("normalizes the configured public app origin", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://example.com/path?ignored=true";

    expect(getSiteUrl()).toBe("https://example.com");
    expect(buildAbsoluteUrl("/privacy")).toBe("https://example.com/privacy");
  });

  it("keeps the sitemap focused on canonical, indexable public pages", () => {
    const paths = getIndexablePages().map((page) => page.path);

    expect(paths).toEqual(["/", "/privacy", "/terms"]);
    expect(paths).not.toContain("/today");
    expect(paths).not.toContain("/dashboard");
  });

  it("generates llms.txt with Markdown companions and canonical pages", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://example.com";

    const body = buildLlmsTxt();

    expect(body).toContain("# Muhasabah");
    expect(body).toContain("Canonical site: https://example.com/");
    expect(body).toContain("- Home: https://example.com/llms/home.md");
    expect(body).toContain("canonical https://example.com/");
    expect(body).toContain("- Privacy Policy: https://example.com/llms/privacy.md");
  });

  it("generates Markdown companions with one H1 and a canonical URL", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://example.com";

    const document = getLlmsDocumentByPath("home.md");
    expect(document).toBeDefined();

    const body = buildLlmsMarkdown(document!);
    const headings = body.match(/^# /gm) ?? [];

    expect(headings).toHaveLength(1);
    expect(body.startsWith("# Muhasabah\n")).toBe(true);
    expect(body).toContain("Canonical page: https://example.com/");
    expect(body).toContain("Start a reflection: https://example.com/today");
  });
});
