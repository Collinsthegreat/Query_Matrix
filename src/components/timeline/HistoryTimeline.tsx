"use client";

import * as React from "react";
import { useStore } from "zustand";
import { RotateCcw, RotateCw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { getSchemaById } from "@/lib/constants";
import { diffQueryTrees } from "@/lib/queryDiff";
import { treeUtils } from "@/lib/treeUtils";
import { useQueryStore } from "@/stores/queryStore";
import { queryTemporalStore, type TemporalSnapshot } from "@/stores/queryTemporal";
import { QueryDiffViewer } from "./QueryDiffViewer";

function summary(snapshot: TemporalSnapshot): string {
  const counts = treeUtils.countNodes(snapshot.tree);
  return `${counts.rules} rules, ${counts.groups} groups`;
}

export function HistoryTimeline() {
  const currentTree = useQueryStore((state) => state.tree);
  const pastStates = useStore(queryTemporalStore, (state) => state.pastStates);
  const futureStates = useStore(queryTemporalStore, (state) => state.futureStates);
  const snapshots = React.useMemo(() => [...pastStates, { tree: currentTree }, ...futureStates.slice().reverse()].slice(-50), [currentTree, futureStates, pastStates]);
  const currentIndex = Math.min(pastStates.length, snapshots.length - 1);
  const previousSnapshot = pastStates[pastStates.length - 1] ?? null;
  const diffs = React.useMemo(() => diffQueryTrees(previousSnapshot?.tree ?? null, currentTree, getSchemaById(currentTree.schemaId)), [currentTree, previousSnapshot]);

  function jump(snapshot: TemporalSnapshot): void {
    useQueryStore.setState((state) => ({ ...state, tree: snapshot.tree }));
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-3.5 shadow-sm" aria-label="History timeline">
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">History</h2>
          <p className="font-mono text-[var(--text-xs)] text-[var(--text-muted)]">50 snapshots max</p>
        </div>
        <div className="flex gap-2">
          <Tooltip content="Undo (⌘Z)">
            <Button type="button" variant="secondary" size="icon" className="h-7 w-7" aria-label="Undo" onClick={() => queryTemporalStore.getState().undo()}>
              <RotateCcw aria-hidden="true" size={15} />
            </Button>
          </Tooltip>
          <Tooltip content="Redo (⌘⇧Z)">
            <Button type="button" variant="secondary" size="icon" className="h-7 w-7" aria-label="Redo" onClick={() => queryTemporalStore.getState().redo()}>
              <RotateCw aria-hidden="true" size={15} />
            </Button>
          </Tooltip>
          <Tooltip content="Clear history">
            <Button type="button" variant="danger" size="icon" className="h-7 w-7" aria-label="Clear history" onClick={() => queryTemporalStore.getState().clear()}>
              <X aria-hidden="true" size={15} />
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="flex min-h-12 items-center overflow-x-auto px-1">
        {snapshots.map((snapshot, index) => (
          <React.Fragment key={`${snapshot.tree.version}-${index}`}>
            {index > 0 && <div className="h-px min-w-8 flex-1 bg-[var(--border-subtle)]" aria-hidden="true" />}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={`Jump to snapshot ${index + 1}`}
                  className="grid h-8 min-w-8 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  onClick={() => jump(snapshot)}
                >
                  <span className={index === currentIndex ? "h-3.5 w-3.5 rounded-full border-2 border-[var(--primary)] bg-[var(--primary)] ring-4 ring-[var(--primary-muted)]" : index < currentIndex ? "h-2.5 w-2.5 rounded-full border border-[var(--primary)] bg-[var(--primary-muted)] opacity-60 transition hover:scale-110 hover:opacity-90" : "h-2.5 w-2.5 rounded-full border border-[var(--border-strong)] bg-[var(--border-default)] opacity-30"} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="font-mono text-sm font-semibold">{summary(snapshot)} — 2 minutes ago</div>
                <pre className="mt-2 max-h-32 overflow-auto rounded-[var(--radius-sm)] bg-[var(--bg-input)] p-2 text-xs text-[var(--text-secondary)]">{JSON.stringify(snapshot.tree.root.children.slice(0, 2), null, 2)}</pre>
              </PopoverContent>
            </Popover>
          </React.Fragment>
        ))}
      </div>
      <QueryDiffViewer diffs={diffs} />
    </section>
  );
}
