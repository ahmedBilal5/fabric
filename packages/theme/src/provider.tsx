"use client";

import { CssBaseline } from "@mui/material";
import { type Theme, ThemeProvider, useColorScheme } from "@mui/material/styles";
import React, { createContext, type ReactNode, useContext, useMemo } from "react";
import { theme as fabricTheme } from "./create-theme";

type ThemeMode = "light" | "dark" | "system";

interface DesignSystemContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedMode: "light" | "dark";
}

const STORAGE_KEY = "fabric-theme-mode";

const DesignSystemContext = createContext<DesignSystemContextValue | undefined>(undefined);

export interface DesignSystemProviderProps {
  children: ReactNode;
  /** Initial color mode when the user hasn't picked one. @default 'system' */
  defaultMode?: ThemeMode;
  /** A custom theme, usually from `createFabricTheme`. Defaults to Fabric's theme. */
  theme?: Theme;
}

function DesignSystemModeProvider({ children }: { children: ReactNode }) {
  const { mode = "system", systemMode = "light", setMode } = useColorScheme();
  const resolvedMode = mode === "system" ? systemMode : mode;

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(resolvedMode);
    }
  }, [resolvedMode]);

  const value = useMemo(
    () => ({
      mode,
      setMode: (next: ThemeMode) => setMode(next),
      resolvedMode,
    }),
    [mode, resolvedMode, setMode],
  );

  return <DesignSystemContext.Provider value={value}>{children}</DesignSystemContext.Provider>;
}

export function DesignSystemProvider({
  children,
  defaultMode = "system",
  theme = fabricTheme,
}: DesignSystemProviderProps) {
  return (
    <ThemeProvider theme={theme} defaultMode={defaultMode} modeStorageKey={STORAGE_KEY}>
      <CssBaseline enableColorScheme />
      <DesignSystemModeProvider>{children}</DesignSystemModeProvider>
    </ThemeProvider>
  );
}

export function useThemeMode() {
  const ctx = useContext(DesignSystemContext);
  if (!ctx) throw new Error("useThemeMode must be used within <DesignSystemProvider>");
  return ctx;
}

export function useSafeThemeMode() {
  const ctx = useContext(DesignSystemContext);
  if (!ctx) return undefined;
  return ctx;
}
