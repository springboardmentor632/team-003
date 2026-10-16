import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import BoardDetail from "./BoardDetail";
import * as decisionsApi from "../api/decisions";
import * as userApi from "../api/user";
import * as authContext from "../context/AuthContext";

vi.mock("../api/decisions");
vi.mock("../api/user");
vi.mock("../api/collaboration");
vi.mock("../api/files");
vi.mock("../components/Discussion", () => ({ default: () => <div data-testid="discussion">Discussion</div> }));
vi.mock("../components/Suggestions", () => ({ default: () => <div data-testid="suggestions">Suggestions</div> }));
vi.mock("../components/Attachments", () => ({ default: () => <div data-testid="attachments">Attachments</div> }));

describe("BoardDetail Custom Criteria", () => {
  const sampleDecision = {
    id: 42,
    title: "Database Architecture",
    description: "Evaluating SQL vs NoSQL",
    category: "Technology",
    visibility: "PUBLIC",
    pollType: "SINGLE_CHOICE",
    closed: false,
    createdBy: "Alice Architect",
    createdByName: "Alice Architect",
    customCriteria: ["Scalability", "Fault Tolerance"],
    options: [
      {
        id: 101,
        title: "PostgreSQL",
        costScore: 9,
        benefitsScore: 9,
        riskScore: 3,
        timeScore: 8,
        convenienceScore: 8,
        customScores: { Scalability: 8, "Fault Tolerance": 9 },
        averageScore: 7.4,
        voteCount: 15,
      },
      {
        id: 102,
        title: "Cassandra",
        costScore: 5,
        benefitsScore: 8,
        riskScore: 7,
        timeScore: 5,
        convenienceScore: 6,
        customScores: { Scalability: 10, "Fault Tolerance": 10 },
        averageScore: 7.3,
        voteCount: 10,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContext, "useAuth").mockReturnValue({
      user: { id: 1, name: "Alice Architect", email: "alice@decisionhub.org", role: "ADMIN" },
    });
    userApi.getSavedDecisionIds.mockResolvedValue({ data: [] });
    decisionsApi.getDecision.mockResolvedValue({ data: sampleDecision });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders standard and user-defined custom criteria with Custom badge", async () => {
    render(
      <BrowserRouter>
        <BoardDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Comparison by criteria")).toBeTruthy();
    });

    expect(screen.getByText("Cost")).toBeTruthy();
    expect(screen.getByText("Benefits")).toBeTruthy();
    expect(screen.getByText("Scalability")).toBeTruthy();
    expect(screen.getByText("Fault Tolerance")).toBeTruthy();
    expect(screen.getAllByText("Custom").length).toBeGreaterThanOrEqual(2);
  });

  it("allows adding a user-defined custom criterion on the fly", async () => {
    decisionsApi.addCriteria.mockResolvedValue({
      data: {
        ...sampleDecision,
        customCriteria: [...sampleDecision.customCriteria, "Developer Experience"],
      },
    });

    render(
      <BrowserRouter>
        <BoardDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("+ Add custom criterion")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("+ Add custom criterion"));
    expect(screen.getByPlaceholderText(/Criterion name/i)).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText(/Criterion name/i), {
      target: { value: "Developer Experience" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Save criterion/i }));

    await waitFor(() => {
      expect(decisionsApi.addCriteria).toHaveBeenCalledWith(undefined, {
        name: "Developer Experience",
        scores: {},
      });
    });
  });

  it("allows deleting a custom criterion on the fly", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    decisionsApi.removeCriteria.mockResolvedValue({
      data: {
        ...sampleDecision,
        customCriteria: ["Fault Tolerance"],
      },
    });

    render(
      <BrowserRouter>
        <BoardDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Scalability")).toBeTruthy();
    });

    const deleteBtn = screen.getByTitle("Delete Scalability");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(decisionsApi.removeCriteria).toHaveBeenCalled();
    });
  });
});
