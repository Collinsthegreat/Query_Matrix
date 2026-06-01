import type { GroupNode, LogicOperator, Operator, QueryNode, QueryTree, RuleNode } from "@/types/query";
import { getSchemaById, OPERATORS_BY_TYPE, SCHEMAS } from "./constants";
import { validateQuery } from "./validators";

export type ImportValidationResult =
  | { valid: true; tree: QueryTree }
  | { valid: false; error: string };

const VALID_OPERATORS = new Set<Operator>([
  "equals", "not_equals",
  "contains", "not_contains",
  "starts_with", "ends_with",
  "greater_than", "less_than",
  "greater_than_or_equal", "less_than_or_equal",
  "in_array", "not_in_array",
  "between",
  "is_null", "is_not_null",
  "regex",
  "date_before", "date_after", "date_between"
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLogic(value: unknown): value is LogicOperator {
  return value === "AND" || value === "OR";
}

function isOperator(value: unknown): value is Operator {
  return typeof value === "string" && VALID_OPERATORS.has(value as Operator);
}

function hasValue(operator: Operator, value: unknown, secondValue: unknown): boolean {
  if (operator === "is_null" || operator === "is_not_null") return true;
  if (operator === "between" || operator === "date_between") {
    return value !== "" && value !== null && value !== undefined && secondValue !== "" && secondValue !== null && secondValue !== undefined;
  }
  return value !== "" && value !== null && value !== undefined;
}

function normalizeRule(node: Record<string, unknown>, schemaId: string, ids: Set<string>): RuleNode {
  if (typeof node.id !== "string" || node.id.trim() === "") {
    throw new Error("Every imported rule needs a non-empty id.");
  }
  if (ids.has(node.id)) {
    throw new Error(`Duplicate node id "${node.id}" found in imported query.`);
  }
  ids.add(node.id);
  if (typeof node.field !== "string") {
    throw new Error(`Rule "${node.id}" has an invalid field.`);
  }
  if (!isOperator(node.operator)) {
    throw new Error(`Rule "${node.id}" uses an unknown operator.`);
  }
  const schema = getSchemaById(schemaId);
  const field = schema.fields.find((candidate) => candidate.key === node.field);
  if (!field) {
    throw new Error(`Rule "${node.id}" references unknown field "${node.field}".`);
  }
  if (!OPERATORS_BY_TYPE[field.type].includes(node.operator)) {
    throw new Error(`Rule "${node.id}" uses an operator that is not valid for ${field.label}.`);
  }
  if (!hasValue(node.operator, node.value, node.secondValue)) {
    throw new Error(`Rule "${node.id}" is missing a required value.`);
  }
  return {
    type: "rule",
    id: node.id,
    field: node.field,
    operator: node.operator,
    value: node.value,
    secondValue: node.secondValue,
    error: typeof node.error === "string" ? node.error : null
  };
}

function normalizeGroup(node: Record<string, unknown>, schemaId: string, ids: Set<string>, isRoot = false): GroupNode {
  if (node.type !== "group") {
    throw new Error(isRoot ? "Imported query root must be a group." : "Imported group has an invalid type.");
  }
  if (typeof node.id !== "string" || node.id.trim() === "") {
    throw new Error("Every imported group needs a non-empty id.");
  }
  if (ids.has(node.id)) {
    throw new Error(`Duplicate node id "${node.id}" found in imported query.`);
  }
  ids.add(node.id);
  if (isRoot && node.id !== "root") {
    throw new Error("Imported query root id must be \"root\".");
  }
  if (!isLogic(node.logic)) {
    throw new Error(`Group "${node.id}" must use AND or OR logic.`);
  }
  if (!Array.isArray(node.children)) {
    throw new Error(`Group "${node.id}" must include a children array.`);
  }
  if (node.children.length > 200) {
    throw new Error(`Group "${node.id}" has too many child nodes.`);
  }
  const children = node.children.map((child) => normalizeNode(child, schemaId, ids));
  return {
    type: "group",
    id: node.id,
    logic: node.logic,
    collapsed: typeof node.collapsed === "boolean" ? node.collapsed : false,
    label: typeof node.label === "string" ? node.label : undefined,
    children
  };
}

function normalizeNode(value: unknown, schemaId: string, ids: Set<string>): QueryNode {
  if (!isObject(value)) {
    throw new Error("Imported query contains a malformed node.");
  }
  if (value.type === "rule") {
    return normalizeRule(value, schemaId, ids);
  }
  if (value.type === "group") {
    return normalizeGroup(value, schemaId, ids);
  }
  throw new Error("Imported query contains an unknown node type.");
}

export function validateImportedQueryTree(value: unknown): ImportValidationResult {
  try {
    if (!isObject(value)) {
      throw new Error("Imported file must contain a QueryTree object.");
    }
    if (typeof value.schemaId !== "string" || !SCHEMAS.some((schema) => schema.id === value.schemaId)) {
      throw new Error("Imported query uses an unknown schema.");
    }
    if (!isObject(value.root)) {
      throw new Error("Imported query is missing a root group.");
    }
    if (typeof value.version !== "number" || !Number.isFinite(value.version)) {
      throw new Error("Imported query version must be a valid number.");
    }
    const ids = new Set<string>();
    const root = normalizeGroup(value.root, value.schemaId, ids, true);
    const tree: QueryTree = { root, schemaId: value.schemaId, version: value.version };
    const validation = validateQuery(tree, getSchemaById(tree.schemaId));
    if (!validation.valid) {
      throw new Error(validation.errors[0]?.message ?? "Imported query did not pass validation.");
    }
    return { valid: true, tree };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : "Imported query is invalid." };
  }
}
