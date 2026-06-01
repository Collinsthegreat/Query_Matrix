import { describe, expect, it } from "vitest";
import { getSchemaById } from "@/lib/constants";
import { diffQueryTrees } from "@/lib/queryDiff";
import { singleRuleTree } from "./testHelpers";

describe("queryDiff", () => {
  it("reports changed rules between snapshots", () => {
    const before = singleRuleTree({ value: 18 });
    const after = singleRuleTree({ value: 30 });

    const diffs = diffQueryTrees(before, after, getSchemaById("users"));

    expect(diffs.some((diff) => diff.tone === "changed" && diff.label.includes("Age"))).toBe(true);
  });

  it("reports added nodes between snapshots", () => {
    const before = singleRuleTree();
    const after = singleRuleTree();
    after.root.children.push({ type: "rule", id: "status", field: "status", operator: "equals", value: "active" });

    const diffs = diffQueryTrees(before, after, getSchemaById("users"));

    expect(diffs.some((diff) => diff.tone === "added" && diff.label.includes("Status"))).toBe(true);
  });
});
