import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem("decisionhub_theme") || "light";
    } catch {
      return "light";
    }
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("decisionhub_theme", newTheme);
    } catch {
      // ignore localstorage errors
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
      root.classList.add("theme-dark");
      root.classList.remove("theme-light");
    } else if (theme === "light") {
      root.setAttribute("data-theme", "light");
      root.classList.add("theme-light");
      root.classList.remove("theme-dark");
    } else {
      // System mode
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const prefersDark = mq.matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
      root.classList.toggle("theme-dark", prefersDark);
      root.classList.toggle("theme-light", !prefersDark);
    }
  }, [theme]);

  // Handle system preference changes if in system mode
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      const root = document.documentElement;
      root.setAttribute("data-theme", e.matches ? "dark" : "light");
      root.classList.toggle("theme-dark", e.matches);
      root.classList.toggle("theme-light", !e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  return context || { theme: "light", setTheme: () => {} };
}
