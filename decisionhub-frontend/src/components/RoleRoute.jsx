import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ allowed = [] }) {
  const { user } = useAuth();
  return allowed.includes(user?.role) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}