import { describe, expect, it } from "vitest";
import { getSchemaById } from "@/lib/constants";
import { validateQuery } from "@/lib/validators";
import { nestedTree, singleRuleTree } from "./testHelpers";

const schema = getSchemaById("users");

describe("Query Validator", () => {
  it("returns valid for a correct single rule", () => {
    expect(validateQuery(singleRuleTree(), schema).valid).toBe(true);
  });

  it("returns invalid when rule has no field selected", () => {
    expect(validateQuery(singleRuleTree({ field: "" }), schema).valid).toBe(false);
  });

  it("returns invalid when rule has no value", () => {
    expect(validateQuery(singleRuleTree({ value: "" }), schema).valid).toBe(false);
  });

  it("returns invalid for empty nested group", () => {
    const tree = singleRuleTree();
    tree.root.children.push({ type: "group", id: "empty", logic: "AND", collapsed: false, children: [] });
    expect(validateQuery(tree, schema).errors.some((error) => error.nodeId === "empty")).toBe(true);
  });

  it("flags incompatible operator for field type", () => {
    expect(validateQuery(singleRuleTree({ field: "age", operator: "contains", value: "2" }), schema).valid).toBe(false);
  });

  it("detects conflicting range conditions", () => {
    const tree = singleRuleTree({ field: "age", operator: "greater_than", value: 50 });
    tree.root.children.push({ type: "rule", id: "r2", field: "age", operator: "less_than", value: 20 });
    expect(validateQuery(tree, schema).errors.some((error) => error.message.includes("Conflicting range"))).toBe(true);
  });

  it("returns invalid when numeric between range starts after it ends", () => {
    const tree = singleRuleTree({ field: "age", operator: "between", value: 60, secondValue: 20 });

    expect(validateQuery(tree, schema).errors.some((error) => error.message.includes("range start"))).toBe(true);
  });

  it("returns invalid when date between range starts after it ends", () => {
    const tree = singleRuleTree({ field: "createdAt", operator: "date_between", value: "2026-03-01", secondValue: "2026-01-01" });

    expect(validateQuery(tree, schema).errors.some((error) => error.message.includes("start date"))).toBe(true);
  });

  it("validates all rules in deeply nested groups", () => {
    const tree = nestedTree();
    expect(validateQuery(tree, schema).valid).toBe(true);
  });
});
