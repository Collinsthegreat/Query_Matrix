import type { QueryNode, QueryTree, RuleNode } from "@/types/query";
import type { ResultRecord } from "@/types/results";
import type { Schema } from "@/types/schema";
import { OPERATOR_LABELS } from "./constants";
import { ruleMatches } from "./executor";

export type ReplayFrame = {
  step: number;
  totalSteps: number;
  nodeId: string;
  label: string;
  detail: string;
  rowsBefore: ResultRecord[];
  rowsAfter: ResultRecord[];
  removedKeys: Set<string>;
  addedKeys: Set<string>;
  totalRows: number;
};

function collectRules(node: QueryNode, output: RuleNode[] = []): RuleNode[] {
  if (node.type === "rule") {
    output.push(node);
    return output;
  }
  node.children.forEach((child) => collectRules(child, output));
  return output;
}

function limitedNodeMatches(node: QueryNode, record: ResultRecord, activeRuleIds: Set<string>): { active: boolean; matches: boolean } {
  if (node.type === "rule") {
    const active = activeRuleIds.has(node.id);
    return { active, matches: active ? ruleMatches(node, record) : true };
  }
  const children = node.children.map((child) => limitedNodeMatches(child, record, activeRuleIds)).filter((child) => child.active);
  if (children.length === 0) return { active: false, matches: true };
  return {
    active: true,
    matches: node.logic === "AND" ? children.every((child) => child.matches) : children.some((child) => child.matches)
  };
}

export function replayRowKey(row: ResultRecord, schema: Schema, fallbackIndex: number): string {
  const preferred = ["id", "email", "orderId", "title", "userId", "name"];
  const field = preferred.find((key) => row[key] !== undefined) ?? schema.fields[0]?.key;
  return `${field ?? "row"}:${String(field ? row[field] : fallbackIndex)}`;
}

function keySet(rows: ResultRecord[], schema: Schema): Set<string> {
  return new Set(rows.map((row, index) => replayRowKey(row, schema, index)));
}

function ruleLabel(rule: RuleNode, schema: Schema): string {
  const field = schema.fields.find((item) => item.key === rule.field);
  return `${field?.label ?? rule.field} ${OPERATOR_LABELS[rule.operator]} ${String(rule.value ?? "")}`;
}

export function buildReplayFrames(tree: QueryTree, schema: Schema, dataset: ResultRecord[]): ReplayFrame[] {
  const rules = collectRules(tree.root);
  let previousRows = dataset;
  return rules.map((rule, index) => {
    const activeRuleIds = new Set(rules.slice(0, index + 1).map((item) => item.id));
    const rowsAfter = dataset.filter((record) => limitedNodeMatches(tree.root, record, activeRuleIds).matches);
    const beforeKeys = keySet(previousRows, schema);
    const afterKeys = keySet(rowsAfter, schema);
    const frame: ReplayFrame = {
      step: index + 1,
      totalSteps: rules.length,
      nodeId: rule.id,
      label: ruleLabel(rule, schema),
      detail: `${rowsAfter.length}/${dataset.length} rows remain after this condition`,
      rowsBefore: previousRows,
      rowsAfter,
      removedKeys: new Set([...beforeKeys].filter((key) => !afterKeys.has(key))),
      addedKeys: new Set([...afterKeys].filter((key) => !beforeKeys.has(key))),
      totalRows: dataset.length
    };
    previousRows = rowsAfter;
    return frame;
  });
}
