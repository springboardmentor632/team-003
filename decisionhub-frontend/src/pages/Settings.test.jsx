import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "../context/ThemeContext";
import Settings from "./Settings";

const mockGetProfile = vi.fn();
const mockUpdateProfile = vi.fn();
const mockUpdateUserInterests = vi.fn();
const mockChangePassword = vi.fn();

vi.mock("../api/user", () => ({
  getProfile: () => mockGetProfile(),
  updateProfile: (data) => mockUpdateProfile(data),
  updateUserInterests: (interests) => mockUpdateUserInterests(interests),
  changePassword: (data) => mockChangePassword(data),
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, fullName: "Sarah Connor", email: "sarah@example.com" },
    updateUserProfile: vi.fn(),
  }),
}));

describe("Settings Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProfile.mockResolvedValue({
      data: {
        id: 1,
        name: "Sarah Connor",
        email: "sarah@example.com",
        bio: "Resistance Leader",
        avatarUrl: "https://example.com/sarah.png",
        interests: ["Technology", "Career"],
      },
    });
    mockUpdateProfile.mockResolvedValue({
      data: {
        id: 1,
        name: "Sarah Connor",
        bio: "Updated Bio",
        avatarUrl: "https://example.com/sarah.png",
      },
    });
    mockUpdateUserInterests.mockResolvedValue({
      data: ["Technology", "Career", "Finance"],
    });
    mockChangePassword.mockResolvedValue({
      data: { status: "SUCCESS" },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders public profile form and updates bio", async () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    expect(await screen.findByDisplayValue("Sarah Connor")).toBeTruthy();
    expect(screen.getByDisplayValue("Resistance Leader")).toBeTruthy();

    const bioInput = screen.getByDisplayValue("Resistance Leader");
    fireEvent.change(bioInput, { target: { value: "Updated Bio" } });

    fireEvent.click(screen.getByRole("button", { name: "Save Profile" }));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ bio: "Updated Bio" })
      );
      expect(screen.getByText("Profile updated successfully!")).toBeTruthy();
    });
  });

  it("toggles and saves category preferences", async () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    expect(await screen.findByText("Category Interests & Preferences")).toBeTruthy();

    const financeChip = screen.getByText("+ Finance");
    fireEvent.click(financeChip);

    fireEvent.click(screen.getByRole("button", { name: "Update Interests" }));

    await waitFor(() => {
      expect(mockUpdateUserInterests).toHaveBeenCalledWith(
        expect.arrayContaining(["Technology", "Career", "Finance"])
      );
      expect(screen.getByText("Category interests saved successfully!")).toBeTruthy();
    });
  });

  it("validates and submits password change", async () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    expect(await screen.findByText("Account Security")).toBeTruthy();

    const currentPass = screen.getByLabelText("Current Password");
    const newPass = screen.getByLabelText("New Password");
    const confirmPass = screen.getByLabelText("Confirm New Password");

    fireEvent.change(currentPass, { target: { value: "OldPassword123!" } });
    fireEvent.change(newPass, { target: { value: "BrandNewPass456!" } });
    fireEvent.change(confirmPass, { target: { value: "BrandNewPass456!" } });

    fireEvent.click(screen.getByRole("button", { name: "Change Password" }));

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith({
        currentPassword: "OldPassword123!",
        newPassword: "BrandNewPass456!",
      });
      expect(screen.getByText("Password changed successfully!")).toBeTruthy();
    });
  });

  it("renders appearance & theme controls and toggles dark mode", async () => {
    render(
      <ThemeProvider>
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      </ThemeProvider>
    );

    expect(await screen.findByText("Appearance & Theme")).toBeTruthy();
    const darkModeBtn = screen.getByRole("button", { name: /Dark Mode/i });
    expect(darkModeBtn).toBeTruthy();

    fireEvent.click(darkModeBtn);
    expect(screen.getByText(/Dark Theme Active/i)).toBeTruthy();
  });
});
