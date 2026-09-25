import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({ listComments: vi.fn(), createComment: vi.fn(), reactToComment: vi.fn(), updateComment: vi.fn(), deleteComment: vi.fn() }));
vi.mock("../api/collaboration", () => mocks);
vi.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: { fullName: "Maya User", role: "USER" } }) }));
import Discussion from "./Discussion";

const comment = { id: 1, authorName: "Maya User", body: "Original thought", createdAt: new Date().toISOString(), reactionCount: 0, parentCommentId: null };

describe("Discussion", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.listComments.mockResolvedValue({ data: [comment] }); mocks.createComment.mockResolvedValue({ data: { ...comment, id: 2, body: "Reply text", parentCommentId: 1 } }); mocks.updateComment.mockResolvedValue({ data: { ...comment, body: "Edited thought" } }); mocks.deleteComment.mockResolvedValue({}); window.prompt = vi.fn(() => "Edited thought"); window.confirm = vi.fn(() => true); });

  it("supports reply, edit, and delete actions", async () => {
    render(<Discussion boardId="8" />);
    expect(await screen.findByText("Original thought")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Reply" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Reply text" } });
    fireEvent.click(screen.getByRole("button", { name: /Post comment/i }));
    await waitFor(() => expect(mocks.createComment).toHaveBeenCalledWith("8", { content: "Reply text", parentCommentId: 1 }));
    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    await waitFor(() => expect(mocks.updateComment).toHaveBeenCalledWith("8", 1, { content: "Edited thought" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    await waitFor(() => expect(mocks.deleteComment).toHaveBeenCalledWith("8", 1));
  });

  it("shows a readable API error", async () => {
    mocks.listComments.mockRejectedValue({ response: { data: { error: "Conversation unavailable" } } });
    render(<Discussion boardId="8" />);
    expect(await screen.findByText("Conversation unavailable")).toBeTruthy();
  });
});