"use client";

import { Tooltip } from "@/components/ui/Tooltip";
import type { ComplexityResult } from "@/lib/complexity";

export function ComplexityBadge({ complexity }: { complexity: ComplexityResult }) {
  const fillColor = complexity.label === "Simple" ? "var(--success)" : complexity.label === "Moderate" ? "var(--warning)" : complexity.label === "Complex" ? "var(--complex)" : "var(--danger)";
  return (
    <Tooltip
      content={
        <div className="space-y-1">
          <div className="font-semibold">Complexity breakdown</div>
          <div>Rules: {complexity.breakdown.rules}</div>
          <div>Groups: {complexity.breakdown.groups}</div>
          <div>Depth: {complexity.breakdown.depth}</div>
          <div>Logic switches: {complexity.breakdown.logicSwitches}</div>
        </div>
      }
    >
      <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-card)] px-2.5 py-1">
        <span className="text-[var(--text-xs)] font-medium uppercase tracking-[0.07em] text-[var(--text-muted)]">Complexity</span>
        <span aria-hidden="true" className="h-1.5 w-[72px] overflow-hidden rounded-full bg-[var(--border-default)]">
          <span className="block h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, complexity.score)}%`, background: fillColor }} />
        </span>
        <span className="font-mono text-[var(--text-xs)] font-semibold" style={{ color: fillColor }}>{complexity.label} {complexity.score}</span>
      </div>
    </Tooltip>
  );
}
