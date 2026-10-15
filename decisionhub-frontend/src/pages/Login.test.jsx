import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, afterEach } from "vitest";
import Login from "./Login";
import * as AuthContextModule from "../context/AuthContext";

describe("Login Screen", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders login form fields and handles successful submission", async () => {
    const mockLogin = vi.fn().mockResolvedValue({ success: true });
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({ login: mockLogin });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText("Welcome back")).toBeTruthy();
    const emailInput = screen.getByPlaceholderText("jane@example.com");
    const passwordInput = screen.getByPlaceholderText("••••••••••");
    const submitBtn = screen.getByRole("button", { name: /Log in/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });

  it("displays error banner when authentication fails", async () => {
    const mockLogin = vi.fn().mockResolvedValue({ success: false, error: "Invalid credentials" });
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({ login: mockLogin, loginWithDemoGoogle: vi.fn() });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText("jane@example.com");
    const passwordInput = screen.getByPlaceholderText("••••••••••");
    const submitBtn = screen.getByRole("button", { name: /Log in/i });

    fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeTruthy();
    });
  });

  it("renders Google OAuth options and triggers demo Google login", async () => {
    const mockDemoGoogle = vi.fn().mockResolvedValue({ success: true, user: { name: "Google Demo" } });
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({ login: vi.fn(), loginWithDemoGoogle: mockDemoGoogle });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByRole("button", { name: /Sign in with Google/i })).toBeTruthy();
    const demoGoogleBtn = screen.getByRole("button", { name: /One-Click Google Demo Sign-in/i });
    expect(demoGoogleBtn).toBeTruthy();

    fireEvent.click(demoGoogleBtn);
    await waitFor(() => {
      expect(mockDemoGoogle).toHaveBeenCalled();
    });
  });
});
