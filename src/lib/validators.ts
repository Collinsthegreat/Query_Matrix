import type { GroupNode, Operator, QueryNode, QueryTree, RuleNode, ValidationResult } from "@/types/query";
import type { Schema, SchemaField } from "@/types/schema";
import { OPERATORS_BY_TYPE } from "./constants";

export type Conflict = {
  groupId: string;
  message: string;
  explanation: string;
};

function hasValue(operator: Operator, value: unknown, secondValue: unknown): boolean {
  if (operator === "is_null" || operator === "is_not_null") return true;
  if (operator === "between" || operator === "date_between") {
    return value !== "" && value !== null && value !== undefined && secondValue !== "" && secondValue !== null && secondValue !== undefined;
  }
  return value !== "" && value !== null && value !== undefined;
}

function validateRule(rule: RuleNode, schema: Schema): Array<{ nodeId: string; message: string }> {
  const errors: Array<{ nodeId: string; message: string }> = [];
  const field = schema.fields.find((schemaField) => schemaField.key === rule.field);
  if (!rule.field || !field) {
    errors.push({ nodeId: rule.id, message: "Select a field before running this rule." });
    return errors;
  }
  if (!OPERATORS_BY_TYPE[field.type].includes(rule.operator)) {
    errors.push({ nodeId: rule.id, message: `${rule.operator} is not compatible with ${field.label}.` });
  }
  if (!hasValue(rule.operator, rule.value, rule.secondValue)) {
    errors.push({ nodeId: rule.id, message: "Enter a value for this rule." });
  }
  if (field.type === "number" && typeof rule.value !== "number" && rule.value !== "" && Number.isNaN(Number(rule.value))) {
    errors.push({ nodeId: rule.id, message: `${field.label} must be numeric.` });
  }
  if (field.type === "number" && rule.operator === "between") {
    const start = Number(rule.value);
    const end = Number(rule.secondValue);
    if (Number.isNaN(start) || Number.isNaN(end)) {
      errors.push({ nodeId: rule.id, message: `${field.label} range values must be numeric.` });
    } else if (start > end) {
      errors.push({ nodeId: rule.id, message: `${field.label} range start must be less than or equal to the end.` });
    }
  }
  if (field.type === "date" && rule.operator === "date_between") {
    const start = Date.parse(String(rule.value));
    const end = Date.parse(String(rule.secondValue));
    if (Number.isNaN(start) || Number.isNaN(end)) {
      errors.push({ nodeId: rule.id, message: `${field.label} range needs valid start and end dates.` });
    } else if (start > end) {
      errors.push({ nodeId: rule.id, message: `${field.label} start date must be before or equal to the end date.` });
    }
  }
  return errors;
}

function walkValidation(node: QueryNode, schema: Schema, errors: Array<{ nodeId: string; message: string }>): void {
  if (node.type === "rule") {
    errors.push(...validateRule(node, schema));
    return;
  }
  if (node.id !== "root" && node.children.length === 0) {
    errors.push({ nodeId: node.id, message: "Nested groups need at least one condition." });
  }
  node.children.forEach((child) => walkValidation(child, schema, errors));
}

function numericRangeConflicts(group: GroupNode, field: SchemaField): Conflict[] {
  const rules = group.children.filter((child): child is RuleNode => child.type === "rule" && child.field === field.key);
  const greater = rules.filter((rule) => rule.operator === "greater_than" || rule.operator === "greater_than_or_equal");
  const lesser = rules.filter((rule) => rule.operator === "less_than" || rule.operator === "less_than_or_equal");
  const conflicts: Conflict[] = [];
  greater.forEach((gtRule) => {
    lesser.forEach((ltRule) => {
      if (Number(gtRule.value) >= Number(ltRule.value)) {
        conflicts.push({
          groupId: group.id,
          message: "This condition can never return results",
          explanation: `Conflicting range: ${field.label} lower bound ${String(gtRule.value)} is greater than or equal to upper bound ${String(ltRule.value)}.`
        });
      }
    });
  });
  return conflicts;
}

function duplicateEqualsConflicts(group: GroupNode): Conflict[] {
  if (group.logic !== "AND") return [];
  const equalsRules = group.children.filter((child): child is RuleNode => child.type === "rule" && child.operator === "equals");
  const byField = new Map<string, Set<string>>();
  equalsRules.forEach((rule) => {
    const bucket = byField.get(rule.field) ?? new Set<string>();
    bucket.add(String(rule.value));
    byField.set(rule.field, bucket);
  });
  return Array.from(byField.entries())
    .filter(([, values]) => values.size > 1)
    .map(([field]) => ({
      groupId: group.id,
      message: "This condition can never return results",
      explanation: `Duplicate ${field} equality checks inside an AND group require one field to equal multiple values at once.`
    }));
}

function collectConflicts(node: QueryNode, schema: Schema): Conflict[] {
  if (node.type === "rule") return [];
  const fieldConflicts = schema.fields
    .filter((field) => field.type === "number")
    .flatMap((field) => numericRangeConflicts(node, field));
  const ownConflicts = [...fieldConflicts, ...duplicateEqualsConflicts(node)];
  return [...ownConflicts, ...node.children.flatMap((child) => collectConflicts(child, schema))];
}

export function detectConflicts(tree: QueryTree, schema: Schema): Conflict[] {
  return collectConflicts(tree.root, schema);
}

export function validateQuery(tree: QueryTree, schema: Schema): ValidationResult {
  const errors: Array<{ nodeId: string; message: string }> = [];
  walkValidation(tree.root, schema, errors);
  detectConflicts(tree, schema).forEach((conflict) => {
    errors.push({ nodeId: conflict.groupId, message: conflict.explanation });
  });
  return { valid: errors.length === 0, errors };
}
