"use client";

import { create } from "zustand";
import type { QueryExecutionResult, ResultRecord } from "@/types/results";

export type RunHistoryEntry = {
  id: string;
  schemaId: string;
  createdAt: string;
  summary: string;
  result: QueryExecutionResult;
};

type HistoryStore = {
  entries: RunHistoryEntry[];
  lastRunAt: string | null;
  lastResult: QueryExecutionResult | null;
  nodeMatches: Record<string, boolean>;
  highlightedNodeId: string | null;
  addRun: (entry: RunHistoryEntry, nodeMatches: Record<string, boolean>) => void;
  setHighlightedNodeId: (nodeId: string | null) => void;
  clearRuns: () => void;
};

export const useHistoryStore = create<HistoryStore>((set) => ({
  entries: [],
  lastRunAt: null,
  lastResult: null,
  nodeMatches: {},
  highlightedNodeId: null,
  addRun: (entry, nodeMatches) => set((state) => ({
    entries: [entry, ...state.entries].slice(0, 50),
    lastRunAt: entry.createdAt,
    lastResult: entry.result,
    nodeMatches
  })),
  setHighlightedNodeId: (highlightedNodeId) => set({ highlightedNodeId }),
  clearRuns: () => set({ entries: [], lastRunAt: null, lastResult: null, nodeMatches: {} })
}));

export function summarizeResult(result: QueryExecutionResult, rows: ResultRecord[]): string {
  return `${result.matchedRows} of ${rows.length} records matched in ${result.executionTime}ms`;
}
