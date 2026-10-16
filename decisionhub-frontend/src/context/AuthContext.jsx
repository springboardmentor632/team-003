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
      id: authResponse.userId || authResponse.id,
      fullName: authResponse.fullName || authResponse.name,
      email: authResponse.email,
      role: authResponse.role || "USER",
      avatarUrl: authResponse.avatarUrl || authResponse.avatar || null,
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

  const loginWithToken = useCallback(async (token) => {
    try {
      localStorage.setItem("decisionhub_token", token);
      const { data } = await authApi.getCurrentUser();
      const userInfo = {
        id: data.id || data.userId,
        fullName: data.name || data.fullName,
        email: data.email,
        role: data.role || "USER",
        avatarUrl: data.avatarUrl || data.avatar || null,
      };
      localStorage.setItem("decisionhub_user", JSON.stringify(userInfo));
      setUser(userInfo);
      return { success: true, user: userInfo };
    } catch (err) {
      localStorage.removeItem("decisionhub_token");
      localStorage.removeItem("decisionhub_user");
      setUser(null);
      return { success: false, error: extractErrorMessage(err, "Failed to authenticate with token") };
    }
  }, []);

  const loginWithOAuthGoogle = useCallback(async ({ email, name }) => {
    try {
      const { data } = await authApi.loginOAuth2Google({ email, name });
      return { success: true, user: persistSession(data) };
    } catch (err) {
      return { success: false, error: extractErrorMessage(err, "Google sign-in failed") };
    }
  }, []);

  const loginWithDemoGoogle = useCallback(async () => {
    try {
      const { data } = await authApi.demoGoogleLogin();
      return { success: true, user: persistSession(data) };
    } catch (err) {
      return { success: false, error: extractErrorMessage(err, "Demo Google sign-in failed") };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("decisionhub_token");
    localStorage.removeItem("decisionhub_user");
    setUser(null);
  }, []);

  const updateUserProfile = useCallback((patch) => {
    setUser((prev) => {
      const updated = { ...prev, ...patch };
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem("decisionhub_user", JSON.stringify(updated));
        }
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loginWithToken,
        loginWithOAuthGoogle,
        loginWithDemoGoogle,
        updateUserProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
