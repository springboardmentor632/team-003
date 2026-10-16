import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

afterEach(() => {
  cleanup();
});

const mocks = vi.hoisted(() => ({
  listCommunities: vi.fn(),
  listInvitations: vi.fn(),
  joinCommunity: vi.fn(),
  leaveCommunity: vi.fn(),
  createCommunity: vi.fn(),
}));

vi.mock("../api/collaboration", () => ({
  listCommunities: mocks.listCommunities,
  listInvitations: mocks.listInvitations,
  joinCommunity: mocks.joinCommunity,
  leaveCommunity: mocks.leaveCommunity,
  createCommunity: mocks.createCommunity,
}));

vi.mock("../components/TopBar", () => ({
  default: ({ title, action }) => (
    <div>
      <h1>{title}</h1>
      {action}
    </div>
  ),
}));

import Communities from "./Communities";

describe("Communities Page", () => {
  const mockCommunities = [
    {
      id: 1,
      name: "Database Architects Circle",
      description: "Evaluating distributed SQL and NoSQL engines",
      memberCount: 5,
      joined: false,
    },
    {
      id: 2,
      name: "Product Leaders Guild",
      description: "Roadmaps and product decisions",
      memberCount: 12,
      joined: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listCommunities.mockResolvedValue({ data: mockCommunities });
    mocks.listInvitations.mockResolvedValue({ data: [] });
  });

  it("renders community cards with distinct join and leave button colors and labels", async () => {
    render(
      <MemoryRouter>
        <Communities />
      </MemoryRouter>
    );

    expect(await screen.findByText("Database Architects Circle")).toBeTruthy();
    expect(screen.getByText("Product Leaders Guild")).toBeTruthy();

    // Community 1 is not joined -> should have "Join" button with btn-join class
    const joinBtn = screen.getByRole("button", { name: "Join Database Architects Circle" });
    expect(joinBtn).toBeTruthy();
    expect(joinBtn.textContent).toBe("Join");
    expect(joinBtn.className).toContain("btn-join");

    // Community 2 is joined -> should have "Leave" button with btn-leave class
    const leaveBtn = screen.getByRole("button", { name: "Leave Product Leaders Guild" });
    expect(leaveBtn).toBeTruthy();
    expect(leaveBtn.textContent).toBe("Leave");
    expect(leaveBtn.className).toContain("btn-leave");
  });

  it("interactively toggles membership from Join (Teal) to Leave (Coral)", async () => {
    mocks.joinCommunity.mockResolvedValue({
      data: {
        id: 1,
        name: "Database Architects Circle",
        description: "Evaluating distributed SQL and NoSQL engines",
        memberCount: 6,
        joined: true,
      },
    });

    render(
      <MemoryRouter>
        <Communities />
      </MemoryRouter>
    );

    const joinBtn = await screen.findByRole("button", { name: "Join Database Architects Circle" });
    expect(joinBtn.className).toContain("btn-join");

    fireEvent.click(joinBtn);

    await waitFor(() => {
      expect(mocks.joinCommunity).toHaveBeenCalledWith(1);
    });

    // After joining, button switches to Leave with btn-leave class
    const leaveBtn = await screen.findByRole("button", { name: "Leave Database Architects Circle" });
    expect(leaveBtn).toBeTruthy();
    expect(leaveBtn.className).toContain("btn-leave");
    expect(screen.getAllByText("You’re a member").length).toBe(2);
  });
});
