import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, afterEach } from "vitest";
import DecisionCard from "./DecisionCard";

const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("DecisionCard Component", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const sampleDecision = {
    id: 42,
    title: "Kubernetes vs Docker Swarm",
    category: "DevOps",
    closed: false,
    visibility: "PUBLIC",
    pollType: "SINGLE_CHOICE",
    totalVotes: 15,
    options: [
      { id: 1, title: "Kubernetes", voteCount: 10 },
      { id: 2, title: "Docker Swarm", voteCount: 5 },
    ],
  };

  it("renders decision details, category badge, and vote totals", () => {
    render(
      <BrowserRouter>
        <DecisionCard decision={sampleDecision} />
      </BrowserRouter>
    );

    expect(screen.getByText("Kubernetes vs Docker Swarm")).toBeTruthy();
    expect(screen.getByText("DevOps")).toBeTruthy();
    expect(screen.getByText("Voting open")).toBeTruthy();
    expect(screen.getByText("15 votes")).toBeTruthy();
    expect(screen.getByText("single choice")).toBeTruthy();
  });

  it("navigates to board detail page on click", () => {
    render(
      <BrowserRouter>
        <DecisionCard decision={sampleDecision} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText("Kubernetes vs Docker Swarm"));
    expect(mockedNavigate).toHaveBeenCalledWith("/boards/42");
  });

  it("renders closed status badge when decision is closed", () => {
    const closedDecision = { ...sampleDecision, closed: true };
    render(
      <BrowserRouter>
        <DecisionCard decision={closedDecision} />
      </BrowserRouter>
    );

    expect(screen.getByText("Decision reached")).toBeTruthy();
  });
});
