export type FieldType = "string" | "number" | "boolean" | "date" | "enum" | "array";

export type Operator =
  | "equals" | "not_equals"
  | "contains" | "not_contains"
  | "starts_with" | "ends_with"
  | "greater_than" | "less_than"
  | "greater_than_or_equal" | "less_than_or_equal"
  | "in_array" | "not_in_array"
  | "between"
  | "is_null" | "is_not_null"
  | "regex"
  | "date_before" | "date_after" | "date_between";

export type LogicOperator = "AND" | "OR";

export type RuleNode = {
  type: "rule";
  id: string;
  field: string;
  operator: Operator;
  value: unknown;
  secondValue?: unknown;
  error?: string | null;
};

export type GroupNode = {
  type: "group";
  id: string;
  logic: LogicOperator;
  children: QueryNode[];
  collapsed: boolean;
  label?: string;
};

export type QueryNode = RuleNode | GroupNode;

export type QueryTree = {
  root: GroupNode;
  version: number;
  schemaId: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: Array<{ nodeId: string; message: string }>;
};
