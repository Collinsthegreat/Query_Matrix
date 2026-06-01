"use client";

import * as React from "react";
import { Play, Radio } from "lucide-react";
import { buildReplayFrames, type ReplayFrame } from "@/lib/queryReplay";
import { mockDatasets } from "./mockDatasets";
import { useQueryBuilder } from "@/hooks/useQueryBuilder";
import { useRunQuery } from "@/hooks/useRunQuery";
import { useHistoryStore } from "@/stores/historyStore";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { ResultsTable } from "./ResultsTable";

export function QuerySimulator() {
  const { tree, schema } = useQueryBuilder();
  const lastResult = useHistoryStore((state) => state.lastResult);
  const [loading, setLoading] = React.useState(false);
  const [replayFrames, setReplayFrames] = React.useState<ReplayFrame[]>([]);
  const [frameIndex, setFrameIndex] = React.useState(0);
  const [replaying, setReplaying] = React.useState(false);
  const runQuery = useRunQuery();
  const dataset = mockDatasets[schema.id] ?? [];
  const currentFrame = replayFrames[frameIndex] ?? null;
  const rows = currentFrame?.rowsAfter ?? lastResult?.results ?? dataset;
  const scannedRows = currentFrame?.totalRows ?? lastResult?.scannedRows ?? rows.length;

  React.useEffect(() => {
    if (!replaying) return;
    if (frameIndex >= replayFrames.length - 1) {
      const timer = window.setTimeout(() => {
        setReplaying(false);
        void runQuery();
      }, 700);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setFrameIndex((current) => current + 1), 900);
    return () => window.clearTimeout(timer);
  }, [frameIndex, replayFrames.length, replaying, runQuery]);

  async function onRun(): Promise<void> {
    setReplaying(false);
    setLoading(true);
    try {
      await runQuery();
    } finally {
      setLoading(false);
    }
  }

  function onReplay(): void {
    const frames = buildReplayFrames(tree, schema, dataset);
    if (frames.length === 0) return;
    setReplayFrames(frames);
    setFrameIndex(0);
    setReplaying(true);
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3" aria-label="Query simulator">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Results</h2>
          <p className="text-xs text-[var(--text-secondary)]">Mock {schema.name.toLowerCase()} dataset · 100 rows</p>
        </div>
        <Tooltip content="Run query (⌘Enter)">
          <Button type="button" variant="primary" size="sm" onClick={() => void onRun()} disabled={loading}>
            <Play aria-hidden="true" size={15} />
            {loading ? "Running" : "Run Query"}
          </Button>
        </Tooltip>
        <Tooltip content="Replay row elimination">
          <Button type="button" variant="secondary" size="sm" onClick={onReplay} disabled={loading || tree.root.children.length === 0}>
            <Radio aria-hidden="true" size={15} />
            {replaying ? "Replaying" : "Replay"}
          </Button>
        </Tooltip>
      </div>
      {currentFrame && (
        <div className="mb-3 rounded-lg border border-[var(--border-accent)] bg-[var(--accent-muted)] p-3" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-semibold uppercase text-[var(--text-accent)]">Replay step {currentFrame.step} of {currentFrame.totalSteps}</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{currentFrame.label}</div>
              <div className="text-xs text-[var(--text-secondary)]">{currentFrame.detail}</div>
            </div>
            <div className="text-right text-xs text-[var(--text-secondary)]">
              <div>{currentFrame.removedKeys.size} rows faded out</div>
              {currentFrame.addedKeys.size > 0 && <div>{currentFrame.addedKeys.size} rows restored by OR logic</div>}
            </div>
          </div>
        </div>
      )}
      <ResultsTable rows={rows} schema={schema} tree={tree} loading={loading} scannedRows={scannedRows} replayFrame={currentFrame} />
    </section>
  );
}
