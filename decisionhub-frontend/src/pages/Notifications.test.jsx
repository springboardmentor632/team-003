import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

afterEach(() => {
  cleanup();
});


const mocks = vi.hoisted(() => ({
  listNotifications: vi.fn(),
  listInvitations: vi.fn(),
  acceptInvitation: vi.fn(),
  declineInvitation: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  requestPushPermission: vi.fn(),
  disablePushNotifications: vi.fn(),
  sendTestPush: vi.fn(),
  getFcmStatus: vi.fn(),
  isPushSupported: vi.fn(),
  getLocalPushPermission: vi.fn(),
  getSavedPushToken: vi.fn(),
}));

vi.mock("../api/collaboration", () => ({
  listNotifications: mocks.listNotifications,
  listInvitations: mocks.listInvitations,
  acceptInvitation: mocks.acceptInvitation,
  declineInvitation: mocks.declineInvitation,
  markNotificationRead: mocks.markNotificationRead,
  markAllNotificationsRead: mocks.markAllNotificationsRead,
}));

vi.mock("../api/push", () => ({
  requestPushPermission: mocks.requestPushPermission,
  disablePushNotifications: mocks.disablePushNotifications,
  sendTestPush: mocks.sendTestPush,
  getFcmStatus: mocks.getFcmStatus,
  isPushSupported: mocks.isPushSupported,
  getLocalPushPermission: mocks.getLocalPushPermission,
  getSavedPushToken: mocks.getSavedPushToken,
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: 1, fullName: "Test User", role: "USER" }, isAuthenticated: true }),
}));

vi.mock("../components/TopBar", () => ({
  default: ({ title, action }) => (
    <div>
      <h1>{title}</h1>
      {action}
    </div>
  ),
}));

import Notifications from "./Notifications";

describe("Notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listNotifications.mockResolvedValue({
      data: [{ id: 1, message: "A vote was cast", type: "VOTE", createdAt: new Date().toISOString(), read: false }],
    });
    mocks.listInvitations.mockResolvedValue({ data: [] });
    mocks.markAllNotificationsRead.mockResolvedValue({ data: { updated: 1 } });
    mocks.isPushSupported.mockReturnValue(true);
    mocks.getLocalPushPermission.mockReturnValue("default");
    mocks.getSavedPushToken.mockReturnValue(null);
    mocks.getFcmStatus.mockResolvedValue({ data: { enabled: true, configured: false, registeredTokens: 0 } });
    mocks.requestPushPermission.mockImplementation(async () => {
      mocks.getLocalPushPermission.mockReturnValue("granted");
      mocks.getSavedPushToken.mockReturnValue("mock_fcm_token_1");
      return { success: true, token: "mock_fcm_token_1" };
    });
    mocks.disablePushNotifications.mockImplementation(async () => {
      mocks.getSavedPushToken.mockReturnValue(null);
      return { success: true };
    });
    mocks.sendTestPush.mockResolvedValue({ data: { status: "SUCCESS", sentTokens: 1 } });
  });

  it("marks all unread notifications as read", async () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );
    expect(await screen.findByText("A vote was cast")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Mark all read" }));
    await waitFor(() => expect(mocks.markAllNotificationsRead).toHaveBeenCalledOnce());
  });

  it("accepts a pending community invitation", async () => {
    mocks.listInvitations.mockResolvedValue({
      data: [{ id: 9, community: { name: "Product Builders" }, inviter: { name: "Maya" } }],
    });
    mocks.acceptInvitation.mockResolvedValue({});
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );
    expect(await screen.findByText("Product Builders")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Accept" }));
    await waitFor(() => expect(mocks.acceptInvitation).toHaveBeenCalledWith(9));
  });

  it("enables push notifications and dispatches a test push", async () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    const enableBtn = await screen.findByRole("button", { name: /enable push notifications/i });
    expect(enableBtn).toBeTruthy();

    fireEvent.click(enableBtn);

    await waitFor(() => {
      expect(mocks.requestPushPermission).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Push notifications enabled!/i)).toBeTruthy();
    });

    const testPushBtn = screen.getByRole("button", { name: /send test push/i });
    fireEvent.click(testPushBtn);

    await waitFor(() => {
      expect(mocks.sendTestPush).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Test push dispatched/i)).toBeTruthy();
    });
  });
});
