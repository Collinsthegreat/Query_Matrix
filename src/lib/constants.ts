import type { FieldType, Operator } from "@/types/query";
import type { Schema } from "@/types/schema";

export const SCHEMAS: Schema[] = [
  {
    id: "users",
    name: "Users",
    icon: "👤",
    description: "User accounts and profiles",
    color: "#00c9b1",
    fields: [
      { key: "name", label: "Full Name", type: "string", placeholder: "John Doe" },
      { key: "email", label: "Email", type: "string", placeholder: "john@example.com" },
      { key: "age", label: "Age", type: "number", min: 0, max: 120 },
      { key: "country", label: "Country", type: "enum", enumOptions: [
        { label: "Nigeria", value: "NG" },
        { label: "United States", value: "US" },
        { label: "United Kingdom", value: "UK" },
        { label: "Germany", value: "DE" },
        { label: "India", value: "IN" }
      ] },
      { key: "status", label: "Status", type: "enum", enumOptions: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Banned", value: "banned" },
        { label: "Pending", value: "pending" }
      ] },
      { key: "purchases", label: "Total Purchases", type: "number", min: 0 },
      { key: "createdAt", label: "Created At", type: "date" },
      { key: "isVerified", label: "Is Verified", type: "boolean" }
    ]
  },
  {
    id: "orders",
    name: "Orders",
    icon: "📦",
    description: "Purchase orders and transactions",
    color: "#f59e0b",
    fields: [
      { key: "orderId", label: "Order ID", type: "string" },
      { key: "amount", label: "Amount ($)", type: "number", min: 0 },
      { key: "product", label: "Product", type: "string" },
      { key: "status", label: "Status", type: "enum", enumOptions: [
        { label: "Pending", value: "pending" },
        { label: "Processing", value: "processing" },
        { label: "Shipped", value: "shipped" },
        { label: "Delivered", value: "delivered" },
        { label: "Cancelled", value: "cancelled" }
      ] },
      { key: "quantity", label: "Quantity", type: "number", min: 1 },
      { key: "createdAt", label: "Order Date", type: "date" },
      { key: "isPriority", label: "Priority Order", type: "boolean" }
    ]
  },
  {
    id: "products",
    name: "Products",
    icon: "🏪",
    description: "Product catalog and inventory",
    color: "#22c55e",
    fields: [
      { key: "title", label: "Title", type: "string" },
      { key: "price", label: "Price ($)", type: "number", min: 0 },
      { key: "category", label: "Category", type: "enum", enumOptions: [
        { label: "Electronics", value: "electronics" },
        { label: "Clothing", value: "clothing" },
        { label: "Books", value: "books" },
        { label: "Food", value: "food" }
      ] },
      { key: "stock", label: "Stock Count", type: "number", min: 0 },
      { key: "rating", label: "Rating", type: "number", min: 0, max: 5 },
      { key: "isActive", label: "Is Active", type: "boolean" },
      { key: "createdAt", label: "Listed At", type: "date" }
    ]
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: "📊",
    description: "Event tracking and metrics",
    color: "#ec4899",
    fields: [
      { key: "event", label: "Event Name", type: "string" },
      { key: "userId", label: "User ID", type: "string" },
      { key: "page", label: "Page", type: "string" },
      { key: "duration", label: "Duration (ms)", type: "number", min: 0 },
      { key: "source", label: "Source", type: "enum", enumOptions: [
        { label: "Organic", value: "organic" },
        { label: "Paid", value: "paid" },
        { label: "Social", value: "social" },
        { label: "Referral", value: "referral" }
      ] },
      { key: "timestamp", label: "Timestamp", type: "date" },
      { key: "isBounce", label: "Is Bounce", type: "boolean" }
    ]
  }
];

export const OPERATORS_BY_TYPE: Record<FieldType, Operator[]> = {
  string: ["equals", "not_equals", "contains", "not_contains", "starts_with", "ends_with", "is_null", "is_not_null", "regex"],
  number: ["equals", "not_equals", "greater_than", "less_than", "greater_than_or_equal", "less_than_or_equal", "between", "is_null", "is_not_null"],
  boolean: ["equals", "not_equals"],
  date: ["equals", "not_equals", "date_before", "date_after", "date_between", "is_null", "is_not_null"],
  enum: ["equals", "not_equals", "in_array", "not_in_array", "is_null", "is_not_null"],
  array: ["in_array", "not_in_array", "contains"]
};

export const OPERATOR_LABELS: Record<Operator, string> = {
  equals: "equals",
  not_equals: "does not equal",
  contains: "contains",
  not_contains: "does not contain",
  starts_with: "starts with",
  ends_with: "ends with",
  greater_than: "is greater than",
  less_than: "is less than",
  greater_than_or_equal: "is ≥",
  less_than_or_equal: "is ≤",
  in_array: "is in",
  not_in_array: "is not in",
  between: "is between",
  is_null: "is empty",
  is_not_null: "is not empty",
  regex: "matches regex",
  date_before: "is before",
  date_after: "is after",
  date_between: "is between dates"
};

export const FIELD_TYPE_COLOR_VAR: Record<FieldType, string> = {
  string: "var(--type-string)",
  number: "var(--type-number)",
  boolean: "var(--type-boolean)",
  date: "var(--type-date)",
  enum: "var(--type-enum)",
  array: "var(--type-array)"
};

export const SHORTCUTS = {
  "cmd+k": "Open command palette",
  "cmd+z": "Undo",
  "cmd+shift+z": "Redo",
  "cmd+enter": "Run query",
  "cmd+e": "Export query JSON",
  "cmd+i": "Import query JSON",
  "cmd+shift+c": "Copy SQL to clipboard",
  "cmd+/": "Toggle theme",
  "cmd+1": "Switch to Form view",
  "cmd+2": "Switch to Graph view",
  a: "Add rule (when builder focused)",
  g: "Add group (when builder focused)",
  escape: "Close any open modal/palette"
} as const;

export const DEFAULT_SCHEMA_ID = "users";

export function getSchemaById(schemaId: string): Schema {
  return SCHEMAS.find((schema) => schema.id === schemaId) ?? SCHEMAS[0]!;
}

export function defaultValueForType(type: FieldType): unknown {
  if (type === "number") return 0;
  if (type === "boolean") return true;
  if (type === "date") return new Date().toISOString().slice(0, 10);
  if (type === "array") return [];
  return "";
}
