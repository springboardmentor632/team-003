import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({ listReports: vi.fn(), updateReport: vi.fn(), setCommentHidden: vi.fn() }));
vi.mock("../api/collaboration", () => ({ listReports: mocks.listReports, updateReport: mocks.updateReport, setCommentHidden: mocks.setCommentHidden }));
vi.mock("../components/TopBar", () => ({ default: ({ title }) => <h1>{title}</h1> }));
import Reports from "./Reports";

describe("Reports", () => {
  beforeEach(() => { mocks.listReports.mockResolvedValue({ data: [{ id: 1, decisionId: 8, decisionTitle: "Board", reason: "Spam", commentBody: "Bad comment", comment: { id: 4, hidden: false } }] }); mocks.updateReport.mockResolvedValue({}); mocks.setCommentHidden.mockResolvedValue({}); });
  it("shows reported content and hides it", async () => {
    render(<Reports />); expect(await screen.findByText(/Reported comment:/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Hide" }));
    await waitFor(() => expect(mocks.setCommentHidden).toHaveBeenCalledWith(8, 4, true));
  });
});
