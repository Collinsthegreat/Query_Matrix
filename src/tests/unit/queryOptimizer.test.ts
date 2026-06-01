import { describe, expect, it } from "vitest";
import { getSchemaById } from "@/lib/constants";
import { suggestOptimizations } from "@/lib/queryOptimizer";
import { singleRuleTree } from "./testHelpers";

describe("queryOptimizer", () => {
  it("suggests removing weaker numeric lower bounds", () => {
    const tree = singleRuleTree({ id: "age-18", field: "age", operator: "greater_than", value: 18 });
    tree.root.children.push({ type: "rule", id: "age-21", field: "age", operator: "greater_than", value: 21 });

    const suggestions = suggestOptimizations(tree, getSchemaById("users"));

    expect(suggestions.some((suggestion) => suggestion.nodeId === "age-18")).toBe(true);
  });

  it("suggests removing duplicate equality rules", () => {
    const tree = singleRuleTree({ id: "status-a", field: "status", operator: "equals", value: "active" });
    tree.root.children.push({ type: "rule", id: "status-b", field: "status", operator: "equals", value: "active" });

    const suggestions = suggestOptimizations(tree, getSchemaById("users"));

    expect(suggestions.some((suggestion) => suggestion.nodeId === "status-b")).toBe(true);
  });
});
