import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
const mocks = vi.hoisted(() => ({ listSuggestions: vi.fn(), createSuggestion: vi.fn() }));
vi.mock("../api/collaboration", () => ({ listSuggestions: mocks.listSuggestions, createSuggestion: mocks.createSuggestion }));
import Suggestions from "./Suggestions";
describe("Suggestions", () => { beforeEach(() => { mocks.listSuggestions.mockResolvedValue({ data: [] }); mocks.createSuggestion.mockResolvedValue({ data: { id: 1, authorName: "Alex", advice: "Try this" } }); }); it("posts advice", async () => { render(<Suggestions boardId="1" />); fireEvent.change(screen.getByLabelText("Add a suggestion"), { target: { value: "Try this" } }); fireEvent.click(screen.getByRole("button", { name: "Share advice" })); await waitFor(() => expect(mocks.createSuggestion).toHaveBeenCalledWith("1", { content: "Try this" })); expect(await screen.findByText("Try this")).toBeTruthy(); }); });
