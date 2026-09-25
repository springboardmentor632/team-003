import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({ listFeedback: vi.fn(), createFeedback: vi.fn(), listPublicDecisions: vi.fn(), listMyDecisions: vi.fn() }));
vi.mock("../api/collaboration", () => ({ listFeedback: mocks.listFeedback, createFeedback: mocks.createFeedback }));
vi.mock("../api/decisions", () => ({ listPublicDecisions: mocks.listPublicDecisions, listMyDecisions: mocks.listMyDecisions }));
vi.mock("../components/TopBar", () => ({ default: ({ title }) => <h1>{title}</h1> }));
import Feedback from "./Feedback";

describe("Feedback", () => {
  beforeEach(() => { mocks.listFeedback.mockResolvedValue({ data: [] }); mocks.listPublicDecisions.mockResolvedValue({ data: { content: [{ id: 7, title: "Board" }] } }); mocks.listMyDecisions.mockResolvedValue({ data: { content: [] } }); mocks.createFeedback.mockResolvedValue({ data: { id: 1, authorName: "You", message: "Useful", status: "OPEN" } }); });
  it("submits feedback linked to a selected decision", async () => {
    render(<Feedback />); await screen.findByText("Feedback");
    fireEvent.change(screen.getByLabelText("Your feedback"), { target: { value: "Useful" } });
    fireEvent.change(screen.getByLabelText("Related decision (optional)"), { target: { value: "7" } });
    fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));
    await waitFor(() => expect(mocks.createFeedback).toHaveBeenCalledWith({ message: "Useful", decisionId: "7" }));
    expect(await screen.findByText("OPEN")).toBeTruthy();
  });
});
