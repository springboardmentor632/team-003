import React, { createContext, useContext, useState, useCallback } from "react";
import * as authApi from "../api/auth";
import { extractErrorMessage } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("decisionhub_user");
    return stored ? JSON.parse(stored) : null;
  });

  const persistSession = (authResponse) => {
    localStorage.setItem("decisionhub_token", authResponse.token);
    const userInfo = {
      id: authResponse.userId,
      fullName: authResponse.fullName,
      email: authResponse.email,
      role: authResponse.role,
    };
    localStorage.setItem("decisionhub_user", JSON.stringify(userInfo));
    setUser(userInfo);
    return userInfo;
  };

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await authApi.login({ email, password });
      return { success: true, user: persistSession(data) };
    } catch (err) {
      return { success: false, error: extractErrorMessage(err, "Invalid email or password") };
    }
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    try {
      const { data } = await authApi.register({ fullName, email, password });
      return { success: true, user: persistSession(data) };
    } catch (err) {
      return { success: false, error: extractErrorMessage(err, "Could not create your account") };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("decisionhub_token");
    localStorage.removeItem("decisionhub_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
