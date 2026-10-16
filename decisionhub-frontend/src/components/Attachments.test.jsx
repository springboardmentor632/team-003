import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import Attachments from "./Attachments";
import * as filesApi from "../api/files";
import * as authContext from "../context/AuthContext";

vi.mock("../api/files");
vi.mock("../context/AuthContext");

describe("Attachments Component", () => {
  const mockOptions = [
    { id: 101, title: "Option Alpha" },
    { id: 102, title: "Option Beta" },
  ];

  const mockAttachments = [
    {
      id: 1,
      fileName: "feasibility_report.pdf",
      fileType: "DOCUMENT",
      fileSize: 1024 * 500, // 500 KB
      contentType: "application/pdf",
      fileUrl: "/api/files/1/content",
      storageProvider: "LOCAL",
      decisionId: 10,
      optionId: null,
      uploadedByUserId: 1,
      uploadedByName: "Alice Smith",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      fileName: "architecture_diagram.png",
      fileType: "IMAGE",
      fileSize: 1024 * 1024 * 2, // 2 MB
      contentType: "image/png",
      fileUrl: "https://res.cloudinary.com/demo/image/upload/sample.png",
      storageProvider: "CLOUDINARY",
      decisionId: 10,
      optionId: 101,
      uploadedByUserId: 2,
      uploadedByName: "Bob Jones",
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    authContext.useAuth.mockReturnValue({
      user: { id: 1, fullName: "Alice Smith", role: "USER" },
      isAuthenticated: true,
    });
    filesApi.resolveFileUrl.mockImplementation((url) => url);
    filesApi.getDecisionAttachments.mockResolvedValue({ data: mockAttachments });
  });

  afterEach(() => {
    cleanup();
  });

  it("loads and displays attachments list with file names and size badges", async () => {
    render(<Attachments boardId={10} options={mockOptions} canManage={false} />);

    await waitFor(() => {
      expect(screen.getByText("feasibility_report.pdf")).toBeTruthy();
      expect(screen.getByText("architecture_diagram.png")).toBeTruthy();
    });

    expect(screen.getByText("500 KB")).toBeTruthy();
    expect(screen.getByText("2 MB")).toBeTruthy();
    expect(screen.getByText("Option: Option Alpha")).toBeTruthy();
    expect(screen.getByText("Board file")).toBeTruthy();
  });

  it("handles file upload and adds new attachment to list", async () => {
    const newAttachment = {
      id: 3,
      fileName: "cost_breakdown.xlsx",
      fileType: "DOCUMENT",
      fileSize: 1024 * 100,
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      fileUrl: "/api/files/3/content",
      storageProvider: "LOCAL",
      decisionId: 10,
      optionId: null,
      uploadedByUserId: 1,
      uploadedByName: "Alice Smith",
      createdAt: new Date().toISOString(),
    };

    filesApi.uploadFile.mockResolvedValue({ data: newAttachment });

    render(<Attachments boardId={10} options={mockOptions} canManage={false} />);

    await waitFor(() => {
      expect(screen.getByText("feasibility_report.pdf")).toBeTruthy();
    });

    const file = new File(["test data"], "cost_breakdown.xlsx", { type: "application/vnd.ms-excel" });
    const input = document.getElementById("attachment-file-input");

    fireEvent.change(input, { target: { files: [file] } });

    const uploadBtn = screen.getByRole("button", { name: /upload file/i });
    expect(uploadBtn.disabled).toBe(false);

    fireEvent.click(uploadBtn);

    await waitFor(() => {
      expect(filesApi.uploadFile).toHaveBeenCalledTimes(1);
      expect(screen.getByText("cost_breakdown.xlsx")).toBeTruthy();
    });
  });

  it("handles attachment deletion with confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    filesApi.deleteAttachment.mockResolvedValue({});

    render(<Attachments boardId={10} options={mockOptions} canManage={true} />);

    await waitFor(() => {
      expect(screen.getByText("feasibility_report.pdf")).toBeTruthy();
    });

    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(filesApi.deleteAttachment).toHaveBeenCalledWith(1);
      expect(screen.queryByText("feasibility_report.pdf")).toBeNull();
    });
  });
});
