import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: { fullName: "System Admin", role: "ADMIN" } }),
}));

import Demo from "./Demo";

describe("Demo Page with Role-Differentiated Features", () => {
  afterEach(() => {
    cleanup();
  });

  const renderDemo = () =>
    render(
      <BrowserRouter>
        <Demo />
      </BrowserRouter>
    );

  it("renders with default Global Admin persona and shows role capabilities", () => {
    renderDemo();
    expect(screen.getByText("Good to see you, System Admin.")).toBeTruthy();
    expect(screen.getByText(/Role Capabilities & Powers/i)).toBeTruthy();
    expect(screen.getByText(/Full administrative override across all decision boards/i)).toBeTruthy();
    expect(screen.getByText("Global Moderation Queue")).toBeTruthy();
  });

  it("switches to Community Moderator (Arjun Mehta) and exposes content review view", () => {
    renderDemo();
    const modButton = screen.getByRole("button", { name: /⚙️ Community Moderator/i });
    fireEvent.click(modButton);

    expect(screen.getByText("Good to see you, Arjun Mehta.")).toBeTruthy();
    expect(screen.getByText("Content Review & Flags")).toBeTruthy();

    // Click Content Review nav tab
    fireEvent.click(screen.getByText("Content Review & Flags"));
    expect(screen.getByText("Content Review & Discussion Safety")).toBeTruthy();
    expect(screen.getByText(/Microservices Ingress Gateway/i)).toBeTruthy();
  });

  it("switches to Community Owner (Maya Patel) and renders community roster management", () => {
    renderDemo();
    const ownerButton = screen.getByRole("button", { name: /👑 Community Owner/i });
    fireEvent.click(ownerButton);

    expect(screen.getByText("Good to see you, Maya Patel.")).toBeTruthy();
    expect(screen.getByText("Community Roster & Roles")).toBeTruthy();

    // Click Roster nav tab
    fireEvent.click(screen.getByText("Community Roster & Roles"));
    expect(screen.getByText("Community Roster & Permissions")).toBeTruthy();
    expect(screen.getByText("Invite New Colleague to Product Builders")).toBeTruthy();
  });

  it("switches to Community Member (Harish) and accesses verified voting history", () => {
    renderDemo();
    const memberButton = screen.getByRole("button", { name: /👤 Community Member/i });
    fireEvent.click(memberButton);

    expect(screen.getByText("Good to see you, Harish.")).toBeTruthy();
    expect(screen.getByText("Voting History & Receipts")).toBeTruthy();

    // Click Voting History nav tab
    fireEvent.click(screen.getByText("Voting History & Receipts"));
    expect(screen.getByText("Harish's Verified Voting History")).toBeTruthy();
    expect(screen.getByText("REC-9014")).toBeTruthy();
  });

  it("allows testing consensus finalization and voting in board detail", () => {
    renderDemo();
    // Navigate to board detail
    const detailBtn = screen.getByRole("button", { name: /Board details/i });
    fireEvent.click(detailBtn);
    expect(screen.getByText(/Mode Action Toolbar/i)).toBeTruthy();

    // Force close board
    const closeBtn = screen.getByRole("button", { name: /Force Close Board/i });
    fireEvent.click(closeBtn);
    expect(screen.getByText(/Consensus Declared & Voting Concluded/i)).toBeTruthy();
  });

  it("allows interactive voting, community simulation, and ballot resetting on demo boards", () => {
    renderDemo();
    // Navigate to board detail
    const detailBtn = screen.getByRole("button", { name: /Board details/i });
    fireEvent.click(detailBtn);

    // Initial total votes displayed
    expect(screen.getByText("36 votes")).toBeTruthy();

    // Click Vote button on first option
    const voteBtns = screen.getAllByRole("button", { name: /Vote for this option as System/i });
    fireEvent.click(voteBtns[0]);

    // Should update total votes and vote button
    expect(screen.getByText("37 votes")).toBeTruthy();
    expect(screen.getByRole("button", { name: /You voted for this as System/i })).toBeTruthy();

    // Click Simulate 5 Community Votes
    const simulateBtn = screen.getByRole("button", { name: /Simulate 5 Community Votes/i });
    fireEvent.click(simulateBtn);
    expect(screen.getByText("42 votes")).toBeTruthy();

    // Click Reset Ballots
    const resetBtn = screen.getByRole("button", { name: /Reset Ballots/i });
    fireEvent.click(resetBtn);
    expect(screen.getByText("36 votes")).toBeTruthy();
  });
});
