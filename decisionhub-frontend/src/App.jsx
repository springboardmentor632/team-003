import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Boards from "./pages/Boards";
import CreateBoard from "./pages/CreateBoard";
import BoardDetail from "./pages/BoardDetail";
import Communities from "./pages/Communities";
import CommunityDetail from "./pages/CommunityDetail";
import Analytics from "./pages/Analytics";
import Demo from "./pages/Demo";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import ResetPassword from "./pages/ResetPassword";
import Feedback from "./pages/Feedback";

/** Sends already-logged-in users straight to the dashboard instead of the landing/login/register pages. */
function RedirectIfAuthed({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RedirectIfAuthed><Landing /></RedirectIfAuthed>} />
          <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
          <Route path="/register" element={<RedirectIfAuthed><Register /></RedirectIfAuthed>} />
          <Route path="/reset-password" element={<RedirectIfAuthed><ResetPassword /></RedirectIfAuthed>} />
          <Route path="/demo" element={<Demo />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/boards" element={<Boards />} />
            <Route path="/boards/new" element={<CreateBoard />} />
            <Route path="/boards/:id" element={<BoardDetail />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/communities/:id" element={<CommunityDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
