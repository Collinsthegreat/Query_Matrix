import type { GroupNode, QueryNode, QueryTree, RuleNode } from "@/types/query";
import type { Schema } from "@/types/schema";
import { OPERATOR_LABELS } from "./constants";

function fieldLabel(rule: RuleNode, schema: Schema): string {
  return schema.fields.find((field) => field.key === rule.field)?.label.toLowerCase() ?? rule.field;
}

function valueLabel(value: unknown): string {
  if (Array.isArray(value)) return value.map(valueLabel).join(", ");
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (value === null || value === undefined || value === "") return "empty";
  return String(value);
}

function ruleToEnglish(rule: RuleNode, schema: Schema): string {
  const field = fieldLabel(rule, schema);
  if (rule.operator === "is_null") return `${field} is empty`;
  if (rule.operator === "is_not_null") return `${field} is not empty`;
  if (rule.operator === "between" || rule.operator === "date_between") {
    return `${field} is between ${valueLabel(rule.value)} and ${valueLabel(rule.secondValue)}`;
  }
  return `${field} ${OPERATOR_LABELS[rule.operator]} ${valueLabel(rule.value)}`;
}

function groupToEnglish(group: GroupNode, schema: Schema, isRoot = false): string {
  if (group.children.length === 0) return isRoot ? "Find all records." : "all records";
  const joiner = ` ${group.logic} `;
  const text = group.children.map((child) => nodeToEnglish(child, schema)).join(joiner);
  return isRoot ? text : `(${text})`;
}

function nodeToEnglish(node: QueryNode, schema: Schema): string {
  return node.type === "rule" ? ruleToEnglish(node, schema) : groupToEnglish(node, schema);
}

export function explainQuery(tree: QueryTree, schema: Schema): string {
  const subject = schema.name.toLowerCase();
  if (tree.root.children.length === 0) return `Find all ${subject}.`;
  return `Find ${subject} where ${groupToEnglish(tree.root, schema, true)}.`;
}
