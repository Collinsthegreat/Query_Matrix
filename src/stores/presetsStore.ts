"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { QueryTree } from "@/types/query";

export type QueryPreset = {
  id: string;
  name: string;
  createdAt: string;
  tree: QueryTree;
};

type PresetsStore = {
  presets: QueryPreset[];
  savePreset: (name: string, tree: QueryTree) => void;
  deletePreset: (id: string) => void;
};

export const usePresetsStore = create<PresetsStore>()(
  persist(
    (set) => ({
      presets: [],
      savePreset: (name, tree) => set((state) => ({
        presets: [{ id: nanoid(), name, createdAt: new Date().toISOString(), tree }, ...state.presets].slice(0, 24)
      })),
      deletePreset: (id) => set((state) => ({ presets: state.presets.filter((preset) => preset.id !== id) }))
    }),
    { name: "queryforge-presets" }
  )
);
