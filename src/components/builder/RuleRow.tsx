"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import type { RuleNode } from "@/types/query";
import type { Schema } from "@/types/schema";
import { FIELD_TYPE_COLOR_VAR } from "@/lib/constants";
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
  const field = schema.fields.find((item) => item.key === node.field);
  const stateColor = error ? "var(--warning)" : matchState === true ? "var(--success)" : matchState === false ? "var(--danger)" : "transparent";
  const impactTone = impact && impact.percentage > 60 ? "success" : impact && impact.percentage >= 30 ? "warning" : "danger";
  const sortableStyle = {
    "--dnd-transform": CSS.Transform.toString(transform) ?? "none",
    "--dnd-transition": transition ?? "var(--transition-base)",
    "--rule-state-color": stateColor,
    "--field-color": field ? FIELD_TYPE_COLOR_VAR[field.type] : "var(--text-muted)"
  } as React.CSSProperties & Record<"--dnd-transform", string> & Record<"--dnd-transition", string> & Record<"--rule-state-color", string> & Record<"--field-color", string>;

  return (
    <div
      ref={setNodeRef}
      style={sortableStyle}
      data-highlighted={highlightedNodeId === node.id}
      className={cn(
        "sortable-row group relative min-h-10 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2.5 py-2 transition hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)] data-[highlighted=true]:ring-2 data-[highlighted=true]:ring-[var(--primary)]",
        matchState === true && "shadow-success",
        matchState === false && "shadow-danger",
        isDragging && "z-10 opacity-90 shadow-md"
      )}
    >
      <span aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-[3px] rounded-l-[var(--radius-md)] bg-[var(--rule-state-color)] transition-colors" />
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[24px_minmax(120px,1fr)_minmax(150px,1fr)_minmax(120px,1.15fr)_auto_32px] md:items-start">
        <button
          type="button"
          className="hidden h-10 w-6 cursor-grab items-center justify-center rounded-[var(--radius-xs)] text-[var(--border-default)] opacity-0 transition hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] group-hover:opacity-100 md:inline-flex"
          aria-label="Drag to reorder rule"
          {...sortableAttributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" size={17} />
        </button>
        <div className="grid gap-1">
          <FieldSelector rule={node} schema={schema} onChange={(patch) => updateRule(node.id, patch)} />
        </div>
        <OperatorSelector rule={node} schema={schema} onChange={(operator) => updateRule(node.id, { operator, secondValue: undefined })} />
        <ValueInput rule={node} schema={schema} onChange={(patch) => updateRule(node.id, patch)} errorId={errorId} />
        {impact && (
          <span
            className={cn(
              "impact-count inline-flex h-8 items-center justify-center self-start whitespace-nowrap rounded-[var(--radius-xs)] border px-2 font-mono text-[var(--text-xs)] font-semibold",
              impactTone === "success" && "border-[var(--success-border)] bg-[var(--success-muted)] text-[var(--success)]",
              impactTone === "warning" && "border-[var(--warning-border)] bg-[var(--warning-muted)] text-[var(--warning)]",
              impactTone === "danger" && "border-[var(--danger-border)] bg-[var(--danger-muted)] text-[var(--danger)]"
            )}
            title={`${impact.label} rows`}
          >
            {impact.matchedRows}/{impact.totalRows}
          </span>
        )}
        <Tooltip content="Delete rule">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-[var(--danger)] opacity-70 hover:bg-[var(--danger-muted)] hover:text-[var(--danger)]" aria-label="Delete rule" onClick={() => removeNode(node.id)}>
            <Trash2 aria-hidden="true" size={16} />
          </Button>
        </Tooltip>
      </div>
      {error && <p id={errorId} role="alert" className="mt-2 flex items-center gap-1 pl-2 text-[var(--text-xs)] font-medium text-[var(--danger)]"><i className="ti ti-alert-circle" aria-hidden="true" />{error}</p>}
    </div>
  );
}
