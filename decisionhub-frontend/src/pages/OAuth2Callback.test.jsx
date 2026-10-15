import React from "react";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, afterEach } from "vitest";
import OAuth2Callback from "./OAuth2Callback";
import * as AuthContextModule from "../context/AuthContext";

describe("OAuth2Callback Page", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("handles valid token in query params and finalizes login", async () => {
    const mockLoginWithToken = vi.fn().mockResolvedValue({
      success: true,
      user: { id: 1, email: "oauth@google.com", name: "Google User" },
    });
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      loginWithToken: mockLoginWithToken,
    });

    render(
      <MemoryRouter initialEntries={["/oauth2/callback?token=valid-jwt-token-123"]}>
        <OAuth2Callback />
      </MemoryRouter>
    );

    expect(screen.getByText(/Signing in with Google.../i)).toBeTruthy();

    await waitFor(() => {
      expect(mockLoginWithToken).toHaveBeenCalledWith("valid-jwt-token-123");
    });
  });

  it("displays error message when error query parameter is present", async () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      loginWithToken: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/oauth2/callback?error=Google%20account%20access%20denied"]}>
        <OAuth2Callback />
      </MemoryRouter>
    );

    expect(screen.getByText("Authentication Failed")).toBeTruthy();
    expect(screen.getByText("Google account access denied")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Back to Sign In/i })).toBeTruthy();
  });

  it("displays error when no token and no error parameters are provided", async () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      loginWithToken: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/oauth2/callback"]}>
        <OAuth2Callback />
      </MemoryRouter>
    );

    expect(screen.getByText("Authentication Failed")).toBeTruthy();
    expect(screen.getByText(/No authentication token received/i)).toBeTruthy();
  });
});
