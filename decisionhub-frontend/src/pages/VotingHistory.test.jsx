import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import VotingHistory from "./VotingHistory";

const mockListVotingHistory = vi.fn();

vi.mock("../api/user", () => ({
  listVotingHistory: () => mockListVotingHistory(),
}));

describe("VotingHistory Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListVotingHistory.mockResolvedValue({
      data: [
        {
          voteId: 101,
          decisionId: 1,
          decisionTitle: "React vs Vue",
          decisionCategory: "Technology",
          pollType: "SINGLE_CHOICE",
          optionId: 5,
          optionTitle: "React 18",
          rating: null,
          anonymous: false,
          votedAt: "2026-10-15T12:00:00Z",
        },
        {
          voteId: 102,
          decisionId: 2,
          decisionTitle: "Health Benefits Plan",
          decisionCategory: "Healthcare",
          pollType: "RATING",
          optionId: 8,
          optionTitle: "Comprehensive Dental",
          rating: 5,
          anonymous: true,
          votedAt: "2026-10-14T09:30:00Z",
        },
      ],
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders past voting audit records with statistics", async () => {
    render(
      <BrowserRouter>
        <VotingHistory />
      </BrowserRouter>
    );

    expect(await screen.findByText("React vs Vue")).toBeTruthy();
    expect(screen.getByText("React 18")).toBeTruthy();
    expect(screen.getByText("Health Benefits Plan")).toBeTruthy();
    expect(screen.getByText("Comprehensive Dental")).toBeTruthy();
    expect(screen.getByText("★ 5 / 5")).toBeTruthy();
    expect(screen.getByText("Total Votes Cast")).toBeTruthy();
    expect(screen.getByText("Categories Explored")).toBeTruthy();
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
  });

  it("filters history by keyword search", async () => {
    render(
      <BrowserRouter>
        <VotingHistory />
      </BrowserRouter>
    );

    expect(await screen.findByText("React vs Vue")).toBeTruthy();

    const searchInput = screen.getByPlaceholderText("Search past ballots…");
    fireEvent.change(searchInput, { target: { value: "Dental" } });

    expect(screen.queryByText("React vs Vue")).toBeNull();
    expect(screen.getByText("Health Benefits Plan")).toBeTruthy();
  });
});
