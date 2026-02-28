import React, { createContext, useContext, useMemo, useState } from "react";
import { darkColors, lightColors, type ThemeColors } from "../constants/theme";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: Props) {
  const [mode, setMode] = useState<ThemeMode>("light");

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: mode === "light" ? lightColors : darkColors,
      toggleTheme,
    }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
