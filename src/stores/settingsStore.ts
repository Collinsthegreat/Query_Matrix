"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "dark" | "light";
export type BuilderView = "form" | "graph";
export type MobileTab = "Build" | "Preview" | "Results" | "History";

type SettingsStore = {
  theme: ThemeMode;
  viewMode: BuilderView;
  mobileTab: MobileTab;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setViewMode: (viewMode: BuilderView) => void;
  setMobileTab: (mobileTab: MobileTab) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: "dark",
      viewMode: "form",
      mobileTab: "Build",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
      setViewMode: (viewMode) => set({ viewMode }),
      setMobileTab: (mobileTab) => set({ mobileTab })
    }),
    { name: "queryforge-settings" }
  )
);
