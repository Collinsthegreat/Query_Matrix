import { describe, expect, it } from "vitest";
import { getSchemaById } from "@/lib/constants";
import { executeQuery } from "@/lib/executor";
import type { ResultRecord } from "@/types/results";
import { singleRuleTree } from "./testHelpers";

const schema = getSchemaById("users");
const dataset: ResultRecord[] = [
  { name: "Ada", age: 24, country: "NG", status: "active", purchases: 6 },
  { name: "Ben", age: 17, country: "US", status: "inactive", purchases: 1 },
  { name: "Cara", age: 33, country: "UK", status: "active", purchases: 12 }
];

describe("Query Executor", () => {
  it("filters dataset by equals operator", () => {
    expect(executeQuery(singleRuleTree({ field: "country", operator: "equals", value: "NG" }), dataset, schema).matchedRows).toBe(1);
  });

  it("filters dataset by greater than operator", () => {
    expect(executeQuery(singleRuleTree({ field: "age", operator: "greater_than", value: 18 }), dataset, schema).matchedRows).toBe(2);
  });

  it("filters dataset by contains operator", () => {
    expect(executeQuery(singleRuleTree({ field: "name", operator: "contains", value: "a" }), dataset, schema).matchedRows).toBe(2);
  });

  it("applies AND logic correctly", () => {
    const tree = singleRuleTree({ field: "status", operator: "equals", value: "active" });
    tree.root.children.push({ type: "rule", id: "r2", field: "purchases", operator: "greater_than", value: 10 });
    expect(executeQuery(tree, dataset, schema).matchedRows).toBe(1);
  });

  it("applies OR logic correctly", () => {
    const tree = singleRuleTree({ field: "country", operator: "equals", value: "NG" });
    tree.root.logic = "OR";
    tree.root.children.push({ type: "rule", id: "r2", field: "country", operator: "equals", value: "US" });
    expect(executeQuery(tree, dataset, schema).matchedRows).toBe(2);
  });

  it("handles nested AND inside OR", () => {
    const tree = singleRuleTree({ field: "country", operator: "equals", value: "NG" });
    tree.root.logic = "OR";
    tree.root.children.push({ type: "group", id: "g1", logic: "AND", collapsed: false, children: [
      { type: "rule", id: "r2", field: "status", operator: "equals", value: "active" },
      { type: "rule", id: "r3", field: "purchases", operator: "greater_than", value: 10 }
    ] });
    expect(executeQuery(tree, dataset, schema).matchedRows).toBe(2);
  });

  it("handles nested OR inside AND", () => {
    const tree = singleRuleTree({ field: "status", operator: "equals", value: "active" });
    tree.root.children.push({ type: "group", id: "g1", logic: "OR", collapsed: false, children: [
      { type: "rule", id: "r2", field: "country", operator: "equals", value: "NG" },
      { type: "rule", id: "r3", field: "country", operator: "equals", value: "UK" }
    ] });
    expect(executeQuery(tree, dataset, schema).matchedRows).toBe(2);
  });

  it("returns empty array when no records match", () => {
    expect(executeQuery(singleRuleTree({ field: "country", operator: "equals", value: "DE" }), dataset, schema).results).toEqual([]);
  });

  it("returns all records for empty query tree", () => {
    const tree = singleRuleTree();
    tree.root.children = [];
    expect(executeQuery(tree, dataset, schema).matchedRows).toBe(3);
  });
});
