import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mocks = vi.hoisted(() => ({ listNotifications: vi.fn(), listInvitations: vi.fn(), acceptInvitation: vi.fn(), declineInvitation: vi.fn(), markNotificationRead: vi.fn(), markAllNotificationsRead: vi.fn() }));
vi.mock("../api/collaboration", () => ({ listNotifications: mocks.listNotifications, listInvitations: mocks.listInvitations, acceptInvitation: mocks.acceptInvitation, declineInvitation: mocks.declineInvitation, markNotificationRead: mocks.markNotificationRead, markAllNotificationsRead: mocks.markAllNotificationsRead }));
vi.mock("../components/TopBar", () => ({ default: ({ title, action }) => <div><h1>{title}</h1>{action}</div> }));
import Notifications from "./Notifications";

describe("Notifications", () => {
  beforeEach(() => {
    mocks.listNotifications.mockResolvedValue({ data: [{ id: 1, message: "A vote was cast", type: "VOTE", createdAt: new Date().toISOString(), read: false }] });
    mocks.listInvitations.mockResolvedValue({ data: [] });
    mocks.markAllNotificationsRead.mockResolvedValue({ data: { updated: 1 } });
  });
  it("marks all unread notifications as read", async () => {
    render(<MemoryRouter><Notifications /></MemoryRouter>);
    expect(await screen.findByText("A vote was cast")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Mark all read" }));
    await waitFor(() => expect(mocks.markAllNotificationsRead).toHaveBeenCalledOnce());
  });

  it("accepts a pending community invitation", async () => {
    mocks.listInvitations.mockResolvedValue({ data: [{ id: 9, community: { name: "Product Builders" }, inviter: { name: "Maya" } }] });
    mocks.acceptInvitation.mockResolvedValue({});
    render(<MemoryRouter><Notifications /></MemoryRouter>);
    expect(await screen.findByText("Product Builders")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Accept" }));
    await waitFor(() => expect(mocks.acceptInvitation).toHaveBeenCalledWith(9));
  });
});
