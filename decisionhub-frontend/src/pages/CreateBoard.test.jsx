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

  it("adds user-defined custom criteria and includes them in payload", async () => {
    decisionsApi.createDecision.mockResolvedValue({ data: { id: 99, title: "Postgres vs Mongo" } });

    const { container } = render(
      <BrowserRouter>
        <CreateBoard />
      </BrowserRouter>
    );

    // Title
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. MBA vs\. Staying in my Job/i), {
      target: { value: "Postgres vs Mongo" },
    });

    // Add Custom Criterion "Scalability"
    const criterionInput = screen.getByPlaceholderText(/e\.g\. Scalability, Security, Maintainability/i);
    fireEvent.change(criterionInput, { target: { value: "Scalability" } });
    fireEvent.click(screen.getByRole("button", { name: /\+ Add criterion/i }));

    expect(screen.getByText("Scalability")).toBeTruthy();

    // Fill options
    const optionTitles = screen.getAllByPlaceholderText(/^e\.g\. MBA$/i);
    fireEvent.change(optionTitles[0], { target: { value: "PostgreSQL" } });
    fireEvent.change(optionTitles[1], { target: { value: "MongoDB" } });

    // Custom criterion score inputs
    const scalabilityInputs = screen.getAllByPlaceholderText("1-10");
    if (scalabilityInputs.length >= 2) {
      fireEvent.change(scalabilityInputs[0], { target: { value: "9" } });
      fireEvent.change(scalabilityInputs[1], { target: { value: "8" } });
    }

    const form = container.querySelector("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(decisionsApi.createDecision).toHaveBeenCalledTimes(1);
    });

    const callArg = decisionsApi.createDecision.mock.calls[0][0];
    expect(callArg.customCriteria).toEqual(["Scalability"]);
    expect(callArg.options[0].customScores).toEqual({ Scalability: 9 });
    expect(callArg.options[1].customScores).toEqual({ Scalability: 8 });
  });
});
