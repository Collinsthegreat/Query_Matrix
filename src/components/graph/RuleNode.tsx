"use client";

import type { NodeProps } from "reactflow";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { GraphNodeData } from "./graphUtils";

export function RuleGraphNode({ data, selected }: NodeProps<GraphNodeData>) {
  return (
    <div
      className={cn(
        "min-w-56 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 text-left shadow-sm transition",
        selected && "ring-2 ring-[var(--accent)]",
        data.matched === true && "border-[var(--success)] shadow-success",
        data.matched === false && "border-[var(--danger)] shadow-danger"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="truncate text-sm font-semibold text-[var(--text-primary)]">{data.label}</div>
        {data.fieldType && <Badge tone="default">{data.fieldType}</Badge>}
      </div>
      <div className="mt-2 truncate text-xs text-[var(--text-secondary)]">{data.detail}</div>
      {data.impactLabel && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--bg-input)]" aria-label={`${data.impactLabel}, ${data.impactPercentage ?? 0}%`}>
          <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${data.impactPercentage ?? 0}%` }} />
        </div>
      )}
      {data.impactLabel && <div className="mt-1 text-xs font-medium text-[var(--text-accent)]">{data.impactLabel}</div>}
      {data.matched !== undefined && (
        <div className={cn("mt-2 text-xs font-semibold", data.matched ? "text-[var(--success)]" : "text-[var(--danger)]")}>
          {data.matched ? "Matched result" : "No match"}
        </div>
      )}
    </div>
  );
}
