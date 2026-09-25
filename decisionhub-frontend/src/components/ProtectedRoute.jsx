import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function ProtectedRoute() {
  return (
    <div className="shell">
      <Sidebar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}