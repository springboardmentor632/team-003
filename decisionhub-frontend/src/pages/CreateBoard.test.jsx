import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CreateBoard from "./CreateBoard";
import * as decisionsApi from "../api/decisions";
import * as filesApi from "../api/files";

const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useSearchParams: () => [new URLSearchParams()],
  };
});

vi.mock("../api/decisions");
vi.mock("../api/files");

describe("CreateBoard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    filesApi.resolveFileUrl.mockImplementation((url) => url);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders form fields including cover image and options", () => {
    render(
      <BrowserRouter>
        <CreateBoard />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/e\.g\. MBA vs\. Staying in my Job/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/https:\/\/example\.com\/cover\.jpg/i)).toBeTruthy();
    expect(screen.getByText(/Options to compare/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /create decision board/i })).toBeTruthy();
  });

  it("submits board with cover image and option image", async () => {
    decisionsApi.createDecision.mockResolvedValue({ data: { id: 88, title: "Nextjs vs Remix" } });

    const { container } = render(
      <BrowserRouter>
        <CreateBoard />
      </BrowserRouter>
    );

    const titleInput = screen.getByPlaceholderText(/e\.g\. MBA vs\. Staying in my Job/i);
    fireEvent.change(titleInput, { target: { value: "Nextjs vs Remix" } });

    const coverInput = screen.getByPlaceholderText(/https:\/\/example\.com\/cover\.jpg/i);
    fireEvent.change(coverInput, { target: { value: "https://example.com/banner.jpg" } });

    const optionTitles = screen.getAllByPlaceholderText(/^e\.g\. MBA$/i);
    fireEvent.change(optionTitles[0], { target: { value: "Next.js" } });
    fireEvent.change(optionTitles[1], { target: { value: "Remix" } });

    const form = container.querySelector("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(decisionsApi.createDecision).toHaveBeenCalledTimes(1);
    });

    const callArg = decisionsApi.createDecision.mock.calls[0][0];
    expect(callArg.title).toBe("Nextjs vs Remix");
    expect(callArg.imageUrl).toBe("https://example.com/banner.jpg");
    expect(callArg.options[0].title).toBe("Next.js");
    expect(callArg.options[1].title).toBe("Remix");
    expect(mockedNavigate).toHaveBeenCalledWith("/boards/88");
  });
});
