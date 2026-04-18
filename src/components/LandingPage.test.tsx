import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingPage } from "./LandingPage";

describe("LandingPage SEO links", () => {
  it("links public policy and machine-readable pages from the homepage", () => {
    render(<LandingPage />);

    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: "LLMs" })).toHaveAttribute("href", "/llms.txt");
  });
});
