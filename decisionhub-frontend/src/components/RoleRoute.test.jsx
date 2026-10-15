import React from "react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import RoleRoute from "./RoleRoute";

const storage = new Map();
vi.stubGlobal("localStorage", {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
});

function renderRoute(role) {
  localStorage.setItem("decisionhub_user", JSON.stringify({ fullName: "Test User", role }));
  return render(<AuthProvider><MemoryRouter initialEntries={["/reports"]}><Routes><Route element={<RoleRoute allowed={["ADMIN"]} />}><Route path="/reports" element={<div>Moderation</div>} /></Route><Route path="/dashboard" element={<div>Dashboard</div>} /></Routes></MemoryRouter></AuthProvider>);
}

describe("RoleRoute", () => {
  beforeEach(() => localStorage.clear());

  it("allows admins to reach moderation", () => {
    renderRoute("ADMIN");
    expect(screen.getByText("Moderation")).toBeTruthy();
  });

  it("redirects non-admin users to the dashboard", () => {
    renderRoute("USER");
    expect(screen.getByText("Dashboard")).toBeTruthy();
  });
});