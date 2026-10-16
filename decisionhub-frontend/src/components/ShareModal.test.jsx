import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import ShareModal from "./ShareModal";

describe("ShareModal Component", () => {
  const sampleBoard = {
    id: 101,
    title: "Database Architecture Choice",
    description: "Evaluating Postgres vs DynamoDB for our event ledger",
    visibility: "PUBLIC",
    closed: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <ShareModal isOpen={false} onClose={() => {}} board={sampleBoard} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders board title and direct link tab by default", () => {
    render(
      <ShareModal isOpen={true} onClose={() => {}} board={sampleBoard} />
    );

    expect(screen.getByText("Share Decision Board")).toBeTruthy();
    expect(screen.getByText("Database Architecture Choice")).toBeTruthy();
    expect(screen.getByText("Public Deliberation")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Copy link/i })).toBeTruthy();
  });

  it("copies link to clipboard and shows feedback", async () => {
    const writeTextMock = vi.fn().mockResolvedValue();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <ShareModal isOpen={true} onClose={() => {}} board={sampleBoard} />
    );

    const copyBtn = screen.getByRole("button", { name: /Copy link/i });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled();
      expect(screen.getByText("✓ Copied!")).toBeTruthy();
    });
  });

  it("switches to email invite tab and prepares mailto link", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => {});

    render(
      <ShareModal isOpen={true} onClose={() => {}} board={sampleBoard} />
    );

    const emailTabBtn = screen.getByRole("button", { name: /Email Invite/i });
    fireEvent.click(emailTabBtn);

    expect(screen.getByText("Recipient Email")).toBeTruthy();

    const emailInput = screen.getByPlaceholderText("colleague@organization.org");
    fireEvent.change(emailInput, { target: { value: "lead@acme.org" } });

    const submitBtn = screen.getByRole("button", { name: /Open in Mail Client/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalled();
      expect(openSpy.mock.calls[0][0]).toContain("mailto:lead%40acme.org");
      expect(screen.getByText(/Invitation link prepared for lead@acme.org/i)).toBeTruthy();
    });
  });

  it("switches to Slack & Embed tab and allows copying markdown", async () => {
    const writeTextMock = vi.fn().mockResolvedValue();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <ShareModal isOpen={true} onClose={() => {}} board={sampleBoard} />
    );

    const chatTabBtn = screen.getByRole("button", { name: /Slack & Embed/i });
    fireEvent.click(chatTabBtn);

    const copySnippetBtn = screen.getByRole("button", { name: /Copy snippet/i });
    fireEvent.click(copySnippetBtn);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled();
      expect(screen.getByText("✓ Markdown Copied!")).toBeTruthy();
    });
  });

  it("switches to QR Code tab and displays QR code image", () => {
    render(
      <ShareModal isOpen={true} onClose={() => {}} board={sampleBoard} />
    );

    const qrTabBtn = screen.getByRole("button", { name: /QR Code/i });
    fireEvent.click(qrTabBtn);

    expect(screen.getByText(/Scan with a smartphone camera during live team meetings/i)).toBeTruthy();
    const qrImg = screen.getByAltText(/QR code to vote on Database Architecture Choice/i);
    expect(qrImg).toBeTruthy();
  });

  it("closes when close button or Done is clicked", () => {
    const onClose = vi.fn();
    render(
      <ShareModal isOpen={true} onClose={onClose} board={sampleBoard} />
    );

    const closeBtn = screen.getByLabelText("Close share dialog");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    const doneBtn = screen.getByRole("button", { name: /^Done$/i });
    fireEvent.click(doneBtn);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("closes when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(
      <ShareModal isOpen={true} onClose={onClose} board={sampleBoard} />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
