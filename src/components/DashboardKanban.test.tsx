import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardKanban, type DashboardStatStrip } from "./DashboardKanban";
import type { ActivityDayModel, CategoryCardModel } from "@/lib/dashboardStats";

const statStrip: DashboardStatStrip = {
  todayTotal: 0,
  streak: 0,
  weekAverage: null,
  weekDaysWithData: 0,
  daysLogged: 0,
  dataSourceLabel: "Synced entries",
};

const cards: CategoryCardModel[] = [
  {
    id: "prayers",
    label: "Prayers (Salah)",
    shortLabel: "Prayers",
    value: 0,
    display: "0/10",
    maxLabel: "out of 10",
    percent: 0,
    column: "care",
  },
];

const activityDays: ActivityDayModel[] = [
  { dateKey: "2026-04-14", total: null, level: 0, label: "2026-04-14: no entry" },
  { dateKey: "2026-04-15", total: 47, level: 3, label: "2026-04-15: 47 points" },
];

describe("DashboardKanban", () => {
  it("invites signed-in users to finish today's reflection when cloud completion is missing", () => {
    render(
      <DashboardKanban
        statStrip={statStrip}
        cards={cards}
        activityDays={activityDays}
        hasCompletedToday={false}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: /finish today's reflection/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/you're caught up for today/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /finish today's reflection/i })).toHaveAttribute(
      "href",
      "/today",
    );
  });

  it("shows the caught-up message after today's session is complete", () => {
    render(
      <DashboardKanban
        statStrip={statStrip}
        cards={cards}
        activityDays={activityDays}
        hasCompletedToday={true}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: /you're caught up for today/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /finish today's reflection/i })).not.toBeInTheDocument();
    const edit = screen.getByRole("link", { name: /edit today's reflection/i });
    expect(edit).toHaveAttribute("href", "/today?edit=1");
  });

  it("does not show a Google sync prompt on the authenticated dashboard", () => {
    render(
      <DashboardKanban
        statStrip={statStrip}
        cards={cards}
        activityDays={activityDays}
        hasCompletedToday={true}
      />,
    );

    expect(screen.queryByText(/to sync streaks and history/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /continue with google/i })).not.toBeInTheDocument();
  });

  it("shows a profile menu with sign out when a profile action is provided", () => {
    const onSignOut = vi.fn();

    render(
      <DashboardKanban
        statStrip={statStrip}
        cards={cards}
        activityDays={activityDays}
        hasCompletedToday={true}
        profileMenu={{ onSignOut }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /profile/i }));
    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("does not render score cards when no saved entry is available", () => {
    render(
      <DashboardKanban
        statStrip={statStrip}
        cards={[]}
        activityDays={activityDays}
        hasCompletedToday={true}
      />,
    );

    expect(screen.queryByLabelText("Prayers (Salah)")).not.toBeInTheDocument();
    expect(screen.getByText(/no saved scores for today yet/i)).toBeInTheDocument();
  });

  it("renders a contribution-style activity chart from real day totals", () => {
    render(
      <DashboardKanban
        statStrip={statStrip}
        cards={cards}
        activityDays={activityDays}
        hasCompletedToday={true}
      />,
    );

    expect(screen.getByLabelText("Daily reflection activity")).toBeInTheDocument();
    expect(screen.getByLabelText("2026-04-14: no entry")).toBeInTheDocument();
    expect(screen.getByLabelText("2026-04-15: 47 points")).toBeInTheDocument();
  });

  it("shows saved reflection notes on their matching score cards", () => {
    const cardsWithNote = [
      { ...cards[0], note: "Fajr was focused, but the afternoon slipped." },
    ];

    render(
      <DashboardKanban
        statStrip={statStrip}
        cards={cardsWithNote}
        activityDays={activityDays}
        hasCompletedToday={true}
      />,
    );

    expect(screen.getByText("Fajr was focused, but the afternoon slipped.")).toBeInTheDocument();
  });
});
