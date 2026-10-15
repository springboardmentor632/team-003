import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const mockGet = vi.fn();
vi.mock("../api/client", () => ({
  default: {
    get: (...args) => mockGet(...args),
  },
}));

vi.mock("../components/TopBar", () => ({
  default: ({ title }) => <h1>{title}</h1>,
}));

import Analytics from "./Analytics";

describe("Analytics", () => {
  beforeEach(() => {
    mockGet.mockImplementation((url) => {
      if (url === "/api/analytics/summary") {
        return Promise.resolve({
          data: {
            totalBoards: 1,
            totalVotes: 4,
            boardsWithVotes: 1,
            closedBoards: 0,
            categoryVotes: { Technology: 4 },
            pollTypes: { SINGLE_CHOICE: 1 },
            mostActive: [],
          },
        });
      }
      if (url === "/api/analytics/vote-distribution") {
        return Promise.resolve({ data: [{ decisionId: 1, title: "Tech Stack", voteCount: 4 }] });
      }
      if (url === "/api/analytics/option-popularity") {
        return Promise.resolve({ data: [{ optionName: "React", voteCount: 4, percentage: 100 }] });
      }
      if (url === "/api/analytics/participation") {
        return Promise.resolve({ data: [{ date: "2026-10-15", voteCount: 4 }] });
      }
      if (url === "/api/analytics/decision-trends") {
        return Promise.resolve({ data: [{ month: "Oct", createdCount: 1 }] });
      }
      if (url === "/api/analytics/community-activity") {
        return Promise.resolve({ data: [{ communityName: "Engineering", memberCount: 5, decisionCount: 2 }] });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it("renders extended analytics and reports", async () => {
    render(<Analytics />);
    expect(await screen.findByRole("heading", { name: "Option Popularity" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Vote Distribution" })).toBeTruthy();
  });
});
