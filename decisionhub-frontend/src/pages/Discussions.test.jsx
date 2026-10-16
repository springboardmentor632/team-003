import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Discussions from "./Discussions";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, email: "alex@example.com", fullName: "Alex Rivera", role: "USER" },
  }),
}));

vi.mock("../api/collaboration", () => ({
  listDiscussions: vi.fn(),
  createDiscussion: vi.fn(),
  deleteDiscussion: vi.fn(),
  listDiscussionComments: vi.fn(),
  createDiscussionComment: vi.fn(),
  deleteDiscussionComment: vi.fn(),
  notificationSummary: vi.fn().mockResolvedValue({ data: { unread: 0 } }),
  listNotifications: vi.fn().mockResolvedValue({ data: [] }),
}));

describe("Discussions Page", () => {
  const sampleDiscussions = [
    {
      id: 101,
      title: "Quarterly Strategy Review",
      content: "Let's deliberate on our priorities for next quarter.",
      author: { id: 1, email: "alex@example.com", fullName: "Alex Rivera" },
      createdAt: "2026-10-15T10:00:00Z",
    },
    {
      id: 102,
      title: "Office Hybrid Guidelines",
      content: "Discussion on desk reservation policies.",
      author: { id: 2, email: "maya@example.com", fullName: "Maya Lin" },
      createdAt: "2026-10-15T11:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders discussion thread list", async () => {
    const { listDiscussions } = await import("../api/collaboration");
    listDiscussions.mockResolvedValueOnce({ data: sampleDiscussions });

    render(
      <BrowserRouter>
        <Discussions />
      </BrowserRouter>
    );

    expect(await screen.findByText("Quarterly Strategy Review")).toBeTruthy();
    expect(screen.getByText("Office Hybrid Guidelines")).toBeTruthy();
    expect(screen.getByRole("button", { name: "+ Start Discussion" })).toBeTruthy();
  });

  it("opens thread detail and loads comments when clicked", async () => {
    const { listDiscussions, listDiscussionComments } = await import("../api/collaboration");
    listDiscussions.mockResolvedValueOnce({ data: sampleDiscussions });
    listDiscussionComments.mockResolvedValueOnce({
      data: [
        {
          id: 501,
          content: "I strongly agree with focusing on technical debt.",
          author: { id: 3, fullName: "Jordan Lee" },
          createdAt: "2026-10-15T12:00:00Z",
        },
      ],
    });

    render(
      <BrowserRouter>
        <Discussions />
      </BrowserRouter>
    );

    const threadRow = await screen.findByText("Quarterly Strategy Review");
    fireEvent.click(threadRow);

    expect(await screen.findByText("I strongly agree with focusing on technical debt.")).toBeTruthy();
    expect(screen.getByText("Scale to Decision Board →")).toBeTruthy();
  });
});
