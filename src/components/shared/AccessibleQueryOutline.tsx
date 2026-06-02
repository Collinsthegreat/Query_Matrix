"use client";

import type { QueryNode, QueryTree } from "@/types/query";
import type { Schema } from "@/types/schema";
import { OPERATOR_LABELS } from "@/lib/constants";

function valueText(value: unknown): string {
  if (Array.isArray(value)) return value.map(valueText).join(", ");
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value === null || value === undefined || value === "") return "empty";
  return String(value);
}

function nodeLabel(node: QueryNode, schema: Schema): string {
  if (node.type === "group") {
    return `${node.id === "root" ? "Root group" : node.label ?? "Condition group"} using ${node.logic} logic with ${node.children.length} child conditions`;
  }
  const field = schema.fields.find((item) => item.key === node.field);
  const base = `${field?.label ?? node.field} ${OPERATOR_LABELS[node.operator]}`;
  if (node.operator === "is_null" || node.operator === "is_not_null") return base;
  if (node.operator === "between" || node.operator === "date_between") return `${base} ${valueText(node.value)} and ${valueText(node.secondValue)}`;
  return `${base} ${valueText(node.value)}`;
}

function OutlineNode({ node, schema }: { node: QueryNode; schema: Schema }) {
  return (
    <li>
      <div className="rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)]">
        {nodeLabel(node, schema)}
      </div>
      {node.type === "group" && node.children.length > 0 && (
        <ol className="ml-4 mt-2 grid gap-2 border-l border-[var(--border-default)] pl-3">
          {node.children.map((child) => <OutlineNode key={child.id} node={child} schema={schema} />)}
        </ol>
      )}
    </li>
  );
}

export function AccessibleQueryOutline({ tree, schema }: { tree: QueryTree; schema: Schema }) {
  return (
    <details className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-card)] p-3">
      <summary className="cursor-pointer text-sm font-semibold text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]">
        Screen reader outline
      </summary>
      <p className="mt-2 text-xs text-[var(--text-secondary)]">
        Linear semantic view of the recursive query tree for keyboard and assistive technology review.
      </p>
      <ol className="mt-3 grid gap-2" aria-label="Accessible query outline">
        <OutlineNode node={tree.root} schema={schema} />
      </ol>
    </details>
  );
}
