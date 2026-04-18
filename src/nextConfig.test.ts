import { describe, expect, it } from "vitest";
import nextConfig, { buildProductionCsp } from "../next.config.mjs";

describe("production CSP", () => {
  it("allows Firebase and Google Auth endpoints required by popup sign-in", () => {
    const csp = buildProductionCsp();

    expect(csp).toContain("https://firebase.googleapis.com");
    expect(csp).toContain("https://identitytoolkit.googleapis.com");
    expect(csp).toContain("https://securetoken.googleapis.com");
    expect(csp).toContain("https://firebaseinstallations.googleapis.com");
    expect(csp).toContain("https://apis.google.com");
  });

  it("allows Firebase auth iframes required by Google popup sign-in", () => {
    const csp = buildProductionCsp();

    expect(csp).toContain("frame-src 'self' https://muhasabah-c2776.firebaseapp.com");
  });
});

describe("production security headers", () => {
  it("keeps popup auth compatible with cross-origin Google windows", async () => {
    const headers = await nextConfig.headers();
    const appHeaders = headers.find((entry) => entry.source === "/:path*")?.headers;

    expect(appHeaders).toContainEqual({
      key: "Cross-Origin-Opener-Policy",
      value: "same-origin-allow-popups",
    });
  });
});
