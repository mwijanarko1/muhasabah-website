import { describe, expect, it } from "vitest";
import { buildProductionCsp } from "../next.config.mjs";

describe("production CSP", () => {
  it("allows Firebase and Google Auth endpoints required by popup sign-in", () => {
    const csp = buildProductionCsp();

    expect(csp).toContain("https://firebase.googleapis.com");
    expect(csp).toContain("https://identitytoolkit.googleapis.com");
    expect(csp).toContain("https://securetoken.googleapis.com");
    expect(csp).toContain("https://firebaseinstallations.googleapis.com");
    expect(csp).toContain("https://apis.google.com");
  });
});
