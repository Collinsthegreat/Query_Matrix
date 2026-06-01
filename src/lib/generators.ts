import type { GroupNode, Operator, QueryNode, QueryTree, RuleNode } from "@/types/query";
import type { Schema } from "@/types/schema";

function fieldName(rule: RuleNode, schema: Schema): string {
  return schema.fields.some((field) => field.key === rule.field) ? rule.field : rule.field || "field";
}

function quoteSql(value: unknown): string {
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function arrayValues(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.includes(",")) return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [value];
}

function sqlOperator(rule: RuleNode): string {
  const field = fieldName(rule, { id: "", name: "", icon: "", description: "", color: "", fields: [] });
  switch (rule.operator) {
    case "equals": return `${field} = ${quoteSql(rule.value)}`;
    case "not_equals": return `${field} <> ${quoteSql(rule.value)}`;
    case "contains": return `${field} LIKE ${quoteSql(`%${String(rule.value)}%`)}`;
    case "not_contains": return `${field} NOT LIKE ${quoteSql(`%${String(rule.value)}%`)}`;
    case "starts_with": return `${field} LIKE ${quoteSql(`${String(rule.value)}%`)}`;
    case "ends_with": return `${field} LIKE ${quoteSql(`%${String(rule.value)}`)}`;
    case "greater_than": return `${field} > ${quoteSql(rule.value)}`;
    case "less_than": return `${field} < ${quoteSql(rule.value)}`;
    case "greater_than_or_equal": return `${field} >= ${quoteSql(rule.value)}`;
    case "less_than_or_equal": return `${field} <= ${quoteSql(rule.value)}`;
    case "in_array": return `${field} IN (${arrayValues(rule.value).map(quoteSql).join(", ")})`;
    case "not_in_array": return `${field} NOT IN (${arrayValues(rule.value).map(quoteSql).join(", ")})`;
    case "between": return `${field} BETWEEN ${quoteSql(rule.value)} AND ${quoteSql(rule.secondValue)}`;
    case "is_null": return `${field} IS NULL`;
    case "is_not_null": return `${field} IS NOT NULL`;
    case "regex": return `${field} REGEXP ${quoteSql(rule.value)}`;
    case "date_before": return `${field} < ${quoteSql(rule.value)}`;
    case "date_after": return `${field} > ${quoteSql(rule.value)}`;
    case "date_between": return `${field} BETWEEN ${quoteSql(rule.value)} AND ${quoteSql(rule.secondValue)}`;
  }
}

function renderSqlNode(node: QueryNode, depth: number, schema: Schema): string {
  const indent = "  ".repeat(depth);
  if (node.type === "rule") {
    const expression = sqlOperator({ ...node, field: fieldName(node, schema) });
    return `${indent}${expression}`;
  }
  if (node.children.length === 0) {
    return `${indent}(1 = 1)`;
  }
  const childIndent = "  ".repeat(depth + 1);
  const joined = node.children
    .map((child) => renderSqlNode(child, depth + 1, schema))
    .join(`\n${childIndent}${node.logic}\n`);
  return `${indent}(\n${joined}\n${indent})`;
}

export function generateSQL(tree: QueryTree, schema: Schema): string {
  if (tree.root.children.length === 0) {
    return `SELECT * FROM ${schema.id};`;
  }
  return `SELECT * FROM ${schema.id}\nWHERE ${renderSqlNode(tree.root, 0, schema)}`;
}

type JsonObject = Record<string, unknown>;

function mongoComparison(operator: Operator, value: unknown, secondValue: unknown): JsonObject | unknown {
  switch (operator) {
    case "equals": return value;
    case "not_equals": return { $ne: value };
    case "contains": return { $regex: String(value), $options: "i" };
    case "not_contains": return { $not: { $regex: String(value), $options: "i" } };
    case "starts_with": return { $regex: `^${String(value)}`, $options: "i" };
    case "ends_with": return { $regex: `${String(value)}$`, $options: "i" };
    case "greater_than": return { $gt: value };
    case "less_than": return { $lt: value };
    case "greater_than_or_equal": return { $gte: value };
    case "less_than_or_equal": return { $lte: value };
    case "in_array": return { $in: arrayValues(value) };
    case "not_in_array": return { $nin: arrayValues(value) };
    case "between": return { $gte: value, $lte: secondValue };
    case "is_null": return null;
    case "is_not_null": return { $ne: null };
    case "regex": return { $regex: String(value) };
    case "date_before": return { $lt: value };
    case "date_after": return { $gt: value };
    case "date_between": return { $gte: value, $lte: secondValue };
  }
}

function mongoNode(node: QueryNode): JsonObject {
  if (node.type === "rule") {
    return { [node.field || "field"]: mongoComparison(node.operator, node.value, node.secondValue) };
  }
  const key = node.logic === "AND" ? "$and" : "$or";
  return node.children.length === 0 ? {} : { [key]: node.children.map(mongoNode) };
}

export function generateMongo(tree: QueryTree, schema: Schema): string {
  void schema;
  return JSON.stringify(mongoNode(tree.root), null, 2);
}

function prismaValue(value: unknown): string {
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null || value === undefined) return "null";
  if (Array.isArray(value)) return `[${value.map(prismaValue).join(", ")}]`;
  return `'${String(value).replaceAll("'", "\\'")}'`;
}

function prismaCondition(rule: RuleNode): string {
  const field = rule.field || "field";
  switch (rule.operator) {
    case "equals": return `{ ${field}: ${prismaValue(rule.value)} }`;
    case "not_equals": return `{ ${field}: { not: ${prismaValue(rule.value)} } }`;
    case "contains": return `{ ${field}: { contains: ${prismaValue(rule.value)}, mode: 'insensitive' } }`;
    case "not_contains": return `{ NOT: { ${field}: { contains: ${prismaValue(rule.value)} } } }`;
    case "starts_with": return `{ ${field}: { startsWith: ${prismaValue(rule.value)} } }`;
    case "ends_with": return `{ ${field}: { endsWith: ${prismaValue(rule.value)} } }`;
    case "greater_than": return `{ ${field}: { gt: ${prismaValue(rule.value)} } }`;
    case "less_than": return `{ ${field}: { lt: ${prismaValue(rule.value)} } }`;
    case "greater_than_or_equal": return `{ ${field}: { gte: ${prismaValue(rule.value)} } }`;
    case "less_than_or_equal": return `{ ${field}: { lte: ${prismaValue(rule.value)} } }`;
    case "in_array": return `{ ${field}: { in: ${prismaValue(arrayValues(rule.value))} } }`;
    case "not_in_array": return `{ ${field}: { notIn: ${prismaValue(arrayValues(rule.value))} } }`;
    case "between": return `{ ${field}: { gte: ${prismaValue(rule.value)}, lte: ${prismaValue(rule.secondValue)} } }`;
    case "is_null": return `{ ${field}: null }`;
    case "is_not_null": return `{ ${field}: { not: null } }`;
    case "regex": return `{ ${field}: { contains: ${prismaValue(rule.value)} } }`;
    case "date_before": return `{ ${field}: { lt: ${prismaValue(rule.value)} } }`;
    case "date_after": return `{ ${field}: { gt: ${prismaValue(rule.value)} } }`;
    case "date_between": return `{ ${field}: { gte: ${prismaValue(rule.value)}, lte: ${prismaValue(rule.secondValue)} } }`;
  }
}

function prismaNode(node: QueryNode): string {
  if (node.type === "rule") return prismaCondition(node);
  if (node.children.length === 0) return "{}";
  return `{ ${node.logic}: [${node.children.map(prismaNode).join(", ")}] }`;
}

export function generatePrisma(tree: QueryTree, schema: Schema): string {
  void schema;
  return prismaNode(tree.root);
}

const REST_OPERATOR: Record<Operator, string> = {
  equals: "eq",
  not_equals: "neq",
  contains: "contains",
  not_contains: "not_contains",
  starts_with: "starts_with",
  ends_with: "ends_with",
  greater_than: "gt",
  less_than: "lt",
  greater_than_or_equal: "gte",
  less_than_or_equal: "lte",
  in_array: "in",
  not_in_array: "nin",
  between: "between",
  is_null: "is_null",
  is_not_null: "is_not_null",
  regex: "regex",
  date_before: "before",
  date_after: "after",
  date_between: "date_between"
};

function collectRules(node: QueryNode): RuleNode[] {
  if (node.type === "rule") return [node];
  return node.children.flatMap(collectRules);
}

export function generateRestParams(tree: QueryTree, schema: Schema): string {
  void schema;
  const params = new URLSearchParams();
  collectRules(tree.root).forEach((rule) => {
    if (!rule.field) return;
    const op = REST_OPERATOR[rule.operator];
    const key = rule.operator === "equals" ? `filter[${rule.field}]` : `filter[${rule.field}][${op}]`;
    if (rule.operator === "is_null" || rule.operator === "is_not_null") {
      params.set(key, "true");
      return;
    }
    if (rule.operator === "between" || rule.operator === "date_between") {
      params.set(key, `${String(rule.value)},${String(rule.secondValue)}`);
      return;
    }
    params.set(key, Array.isArray(rule.value) ? rule.value.map(String).join(",") : String(rule.value));
  });
  const output = params.toString();
  return output ? `?${decodeURIComponent(output)}` : "";
}
