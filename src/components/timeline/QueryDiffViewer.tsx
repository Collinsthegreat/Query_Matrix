"use client";

import { Badge } from "@/components/ui/Badge";
import type { QueryDiffItem } from "@/lib/queryDiff";

function toneLabel(tone: QueryDiffItem["tone"]): string {
  if (tone === "added") return "Added";
  if (tone === "removed") return "Removed";
  return "Changed";
}

export function QueryDiffViewer({ diffs }: { diffs: QueryDiffItem[] }) {
  return (
    <div className="mt-3 border-t border-[var(--border-subtle)] pt-3" aria-label="Query diff viewer">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-[var(--text-xs)] font-semibold uppercase tracking-[0.07em] text-[var(--text-muted)]">Diff vs previous</h3>
        <Badge tone={diffs.length > 0 ? "accent" : "default"}>{diffs.length} changes</Badge>
      </div>
      {diffs.length === 0 ? (
        <p className="text-[var(--text-xs)] italic text-[var(--text-disabled)]">No structural changes since the previous snapshot.</p>
      ) : (
        <ul className="grid gap-2">
          {diffs.map((diff) => (
            <li key={diff.id} className="flex flex-wrap items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-card)] px-2 py-2 text-xs">
              <Badge tone={diff.tone === "added" ? "accent" : "default"}>{toneLabel(diff.tone)}</Badge>
              <span className="font-semibold text-[var(--text-primary)]">{diff.label}</span>
              <span className="text-[var(--text-secondary)]">{diff.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
