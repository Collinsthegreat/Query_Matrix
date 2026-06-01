import type { GroupNode, QueryNode, QueryTree, RuleNode } from "@/types/query";
import type { Schema } from "@/types/schema";
import type { QueryExecutionResult, ResultRecord } from "@/types/results";

function numberValue(value: unknown): number {
  return typeof value === "number" ? value : Number(value);
}

function stringValue(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.includes(",")) return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [value];
}

export function ruleMatches(rule: RuleNode, record: ResultRecord): boolean {
  const actual = record[rule.field];
  switch (rule.operator) {
    case "equals": return actual === rule.value || stringValue(actual) === stringValue(rule.value);
    case "not_equals": return !(actual === rule.value || stringValue(actual) === stringValue(rule.value));
    case "contains": return stringValue(actual).toLowerCase().includes(stringValue(rule.value).toLowerCase());
    case "not_contains": return !stringValue(actual).toLowerCase().includes(stringValue(rule.value).toLowerCase());
    case "starts_with": return stringValue(actual).toLowerCase().startsWith(stringValue(rule.value).toLowerCase());
    case "ends_with": return stringValue(actual).toLowerCase().endsWith(stringValue(rule.value).toLowerCase());
    case "greater_than": return numberValue(actual) > numberValue(rule.value);
    case "less_than": return numberValue(actual) < numberValue(rule.value);
    case "greater_than_or_equal": return numberValue(actual) >= numberValue(rule.value);
    case "less_than_or_equal": return numberValue(actual) <= numberValue(rule.value);
    case "in_array": return asArray(rule.value).map(stringValue).includes(stringValue(actual));
    case "not_in_array": return !asArray(rule.value).map(stringValue).includes(stringValue(actual));
    case "between": return numberValue(actual) >= numberValue(rule.value) && numberValue(actual) <= numberValue(rule.secondValue);
    case "is_null": return actual === null || actual === undefined || actual === "";
    case "is_not_null": return actual !== null && actual !== undefined && actual !== "";
    case "regex": {
      try {
        return new RegExp(stringValue(rule.value)).test(stringValue(actual));
      } catch {
        return false;
      }
    }
    case "date_before": return new Date(stringValue(actual)).getTime() < new Date(stringValue(rule.value)).getTime();
    case "date_after": return new Date(stringValue(actual)).getTime() > new Date(stringValue(rule.value)).getTime();
    case "date_between": {
      const time = new Date(stringValue(actual)).getTime();
      return time >= new Date(stringValue(rule.value)).getTime() && time <= new Date(stringValue(rule.secondValue)).getTime();
    }
  }
}

export function nodeMatches(node: QueryNode, record: ResultRecord): boolean {
  if (node.type === "rule") return ruleMatches(node, record);
  if (node.children.length === 0) return true;
  return node.logic === "AND"
    ? node.children.every((child) => nodeMatches(child, record))
    : node.children.some((child) => nodeMatches(child, record));
}

export function matchingFieldKeys(tree: QueryTree, record: ResultRecord): Set<string> {
  const keys = new Set<string>();
  function visit(node: QueryNode): void {
    if (node.type === "rule") {
      if (node.field && ruleMatches(node, record)) keys.add(node.field);
      return;
    }
    node.children.forEach(visit);
  }
  visit(tree.root);
  return keys;
}

export function ruleMatchMap(tree: QueryTree, results: ResultRecord[]): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  function visit(node: QueryNode): void {
    map[node.id] = results.length > 0 && results.some((record) => nodeMatches(node, record));
    if (node.type === "group") node.children.forEach(visit);
  }
  visit(tree.root);
  return map;
}

export function executeQuery(
  tree: QueryTree,
  dataset: ResultRecord[],
  schema: Schema
): QueryExecutionResult {
  void schema;
  const results = tree.root.children.length === 0 ? dataset : dataset.filter((record) => nodeMatches(tree.root, record));
  return {
    results,
    executionTime: 50 + Math.floor(Math.random() * 251),
    scannedRows: dataset.length,
    matchedRows: results.length
  };
}

export function evaluateGroupForFields(group: GroupNode, record: ResultRecord): string[] {
  return group.children.flatMap((child) => {
    if (child.type === "rule") return ruleMatches(child, record) ? [child.field] : [];
    return evaluateGroupForFields(child, record);
  });
}
