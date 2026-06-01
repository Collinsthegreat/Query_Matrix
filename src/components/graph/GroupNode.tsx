"use client";

import type { NodeProps } from "reactflow";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { GraphNodeData } from "./graphUtils";

export function GroupGraphNode({ data, selected }: NodeProps<GraphNodeData>) {
  return (
    <div
      className={cn(
        "min-w-52 rounded-xl border-2 bg-[var(--bg-card)] p-3 text-left shadow-sm transition",
        data.logic === "AND" ? "border-[var(--and-color)]" : "border-[var(--or-color)]",
        selected && "ring-2 ring-[var(--accent)]",
        data.matched === true && "shadow-success",
        data.matched === false && "shadow-danger"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="truncate text-sm font-semibold text-[var(--text-primary)]">{data.label}</div>
        <Badge tone={data.logic === "AND" ? "accent" : "default"}>{data.logic}</Badge>
      </div>
      <div className="mt-2 text-xs text-[var(--text-secondary)]">{data.detail}</div>
      {data.impactLabel && (
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-input)]" aria-label={`${data.impactLabel}, ${data.impactPercentage ?? 0}%`}>
            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${data.impactPercentage ?? 0}%` }} />
          </div>
          <span className="text-xs font-medium text-[var(--text-accent)]">{data.impactLabel}</span>
        </div>
      )}
    </div>
  );
}
