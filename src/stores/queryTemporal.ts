"use client";

import type { StoreApi } from "zustand";
import type { QueryStore } from "./queryStore";
import { useQueryStore } from "./queryStore";

export type TemporalSnapshot = Pick<QueryStore, "tree">;

export type QueryTemporalState = {
  pastStates: TemporalSnapshot[];
  futureStates: TemporalSnapshot[];
  undo: () => void;
  redo: () => void;
  clear: () => void;
};

export const queryTemporalStore = useQueryStore.temporal as unknown as StoreApi<QueryTemporalState>;
