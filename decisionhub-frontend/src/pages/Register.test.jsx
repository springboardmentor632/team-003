import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, afterEach } from "vitest";
import Register from "./Register";
import * as AuthContextModule from "../context/AuthContext";

describe("Register Screen", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("enforces minimum password length of 8 characters", async () => {
    const mockRegister = vi.fn();
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({ register: mockRegister });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Jane Doe"), { target: { value: "Alex" } });
    fireEvent.change(screen.getByPlaceholderText("jane@example.com"), { target: { value: "alex@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("At least 8 characters"), { target: { value: "short" } });

    fireEvent.click(screen.getByRole("button", { name: /Create account/i }));

    expect(screen.getByText("Password must be at least 8 characters")).toBeTruthy();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("submits registration with valid data", async () => {
    const mockRegister = vi.fn().mockResolvedValue({ success: true });
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({ register: mockRegister });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Jane Doe"), { target: { value: "Alex Mercer" } });
    fireEvent.change(screen.getByPlaceholderText("jane@example.com"), { target: { value: "alex@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("At least 8 characters"), { target: { value: "ValidPassword123" } });

    fireEvent.click(screen.getByRole("button", { name: /Create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith("Alex Mercer", "alex@test.com", "ValidPassword123");
    });
  });
});
