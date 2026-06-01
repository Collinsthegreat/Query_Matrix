import type { QueryNode, QueryTree, RuleNode } from "@/types/query";
import type { Schema } from "@/types/schema";
import { OPERATOR_LABELS } from "./constants";

export type QueryDiffItem = {
  id: string;
  tone: "added" | "removed" | "changed";
  label: string;
  detail: string;
};

type FlatNode = {
  id: string;
  label: string;
  signature: string;
};

function ruleLabel(rule: RuleNode, schema: Schema): string {
  const field = schema.fields.find((item) => item.key === rule.field);
  return `${field?.label ?? rule.field} ${OPERATOR_LABELS[rule.operator]}`;
}

function flatten(node: QueryNode, schema: Schema, output = new Map<string, FlatNode>()): Map<string, FlatNode> {
  if (node.type === "rule") {
    output.set(node.id, {
      id: node.id,
      label: ruleLabel(node, schema),
      signature: JSON.stringify({ type: node.type, field: node.field, operator: node.operator, value: node.value, secondValue: node.secondValue })
    });
    return output;
  }
  output.set(node.id, {
    id: node.id,
    label: node.id === "root" ? "Root group" : node.label ?? "Condition group",
    signature: JSON.stringify({ type: node.type, logic: node.logic, children: node.children.map((child) => child.id), collapsed: node.collapsed })
  });
  node.children.forEach((child) => flatten(child, schema, output));
  return output;
}

export function diffQueryTrees(before: QueryTree | null, after: QueryTree, schema: Schema): QueryDiffItem[] {
  if (!before) return [];
  const beforeNodes = flatten(before.root, schema);
  const afterNodes = flatten(after.root, schema);
  const diffs: QueryDiffItem[] = [];

  afterNodes.forEach((node, id) => {
    const previous = beforeNodes.get(id);
    if (!previous) {
      diffs.push({ id: `added-${id}`, tone: "added", label: node.label, detail: "Added to the query tree" });
      return;
    }
    if (previous.signature !== node.signature) {
      diffs.push({ id: `changed-${id}`, tone: "changed", label: node.label, detail: "Changed field, value, logic, or position" });
    }
  });

  beforeNodes.forEach((node, id) => {
    if (!afterNodes.has(id)) {
      diffs.push({ id: `removed-${id}`, tone: "removed", label: node.label, detail: "Removed from the query tree" });
    }
  });

  return diffs.slice(0, 8);
}
