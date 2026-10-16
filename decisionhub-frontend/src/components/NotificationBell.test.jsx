import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import * as collaboration from "../api/collaboration";

vi.mock("../api/collaboration", () => ({
  listNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  notificationSummary: vi.fn(),
}));

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    collaboration.listNotifications.mockResolvedValue({ data: [{ id: 1, message: "A new vote arrived", createdAt: new Date().toISOString(), read: false, decisionId: 4, type: "VOTE" }] });
    collaboration.notificationSummary.mockResolvedValue({ data: { unread: 1 } });
    collaboration.markNotificationRead.mockResolvedValue({ data: { id: 1, message: "A new vote arrived", createdAt: new Date().toISOString(), read: true, decisionId: 4, type: "VOTE" } });
  });

  it("shows unread notifications and marks them read when opened", async () => {
    render(<MemoryRouter><NotificationBell /></MemoryRouter>);
    const button = await screen.findByRole("button", { name: /notifications, 1 unread/i });
    fireEvent.click(button);
    expect(await screen.findByText("A new vote arrived")).toBeTruthy();
    fireEvent.click(screen.getByText("A new vote arrived"));
    await waitFor(() => expect(collaboration.markNotificationRead).toHaveBeenCalledWith(1));
  });
});