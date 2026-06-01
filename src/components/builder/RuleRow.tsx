"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import type { RuleNode } from "@/types/query";
import type { Schema } from "@/types/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { useQueryStore } from "@/stores/queryStore";
import { useHistoryStore } from "@/stores/historyStore";
import type { QueryImpact } from "@/lib/queryImpact";
import { FieldSelector } from "./FieldSelector";
import { OperatorSelector } from "./OperatorSelector";
import { ValueInput } from "./ValueInput";

type Props = {
  node: RuleNode;
  parentId: string;
  schema: Schema;
  error?: string;
  impact?: QueryImpact;
};

export function RuleRow({ node, parentId, schema, error, impact }: Props) {
  void parentId;
  const updateRule = useQueryStore((state) => state.updateRule);
  const removeNode = useQueryStore((state) => state.removeNode);
  const nodeMatches = useHistoryStore((state) => state.nodeMatches);
  const highlightedNodeId = useHistoryStore((state) => state.highlightedNodeId);
  const matchState = nodeMatches[node.id];
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: node.id });
  const sortableAttributes = { ...attributes, "aria-roledescription": "sortable" };
  const errorId = error ? `error-${node.id}` : undefined;
  const sortableStyle = {
    "--dnd-transform": CSS.Transform.toString(transform) ?? "none",
    "--dnd-transition": transition ?? "var(--transition-base)"
  } as React.CSSProperties & Record<"--dnd-transform", string> & Record<"--dnd-transition", string>;

  return (
    <div
      ref={setNodeRef}
      style={sortableStyle}
      data-highlighted={highlightedNodeId === node.id}
      className={cn(
        "sortable-row group rounded-lg border border-[var(--border)] bg-[var(--bg-input)] p-3 transition hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] data-[highlighted=true]:ring-2 data-[highlighted=true]:ring-[var(--accent)]",
        error && "border-l-2 border-l-[var(--danger)]",
        matchState === true && "border-l-2 border-l-[var(--success)] shadow-success",
        matchState === false && "border-l-2 border-l-[var(--danger)] shadow-danger",
        isDragging && "z-10 opacity-90 shadow-md"
      )}
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[32px_minmax(120px,1fr)_minmax(160px,1fr)_minmax(120px,1.2fr)_44px] md:items-start">
        <button
          type="button"
          className="hidden h-11 w-8 cursor-grab items-center justify-center rounded text-[var(--text-muted)] opacity-0 transition hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] group-hover:opacity-100 md:inline-flex"
          aria-label="Drag to reorder rule"
          {...sortableAttributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" size={17} />
        </button>
        <div className="grid gap-1">
          <FieldSelector rule={node} schema={schema} onChange={(patch) => updateRule(node.id, patch)} />
          {impact && <span className="text-xs font-medium text-[var(--text-accent)]">{impact.label} · {impact.percentage}%</span>}
        </div>
        <OperatorSelector rule={node} schema={schema} onChange={(operator) => updateRule(node.id, { operator, secondValue: undefined })} />
        <ValueInput rule={node} schema={schema} onChange={(patch) => updateRule(node.id, patch)} errorId={errorId} />
        <Tooltip content="Delete rule">
          <Button type="button" variant="ghost" size="icon" aria-label="Delete rule" onClick={() => removeNode(node.id)}>
            <Trash2 aria-hidden="true" size={16} />
          </Button>
        </Tooltip>
      </div>
      {error && <p id={errorId} role="alert" className="mt-2 text-xs font-medium text-[var(--danger)]">{error}</p>}
    </div>
  );
}
