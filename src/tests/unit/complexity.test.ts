import { describe, expect, it } from "vitest";
import { calculateComplexity } from "@/lib/complexity";
import { createInitialTree } from "@/lib/treeUtils";
import { nestedTree, singleRuleTree } from "./testHelpers";

describe("Complexity calculator", () => {
  it("scores a simple query in the Simple tier", () => {
    expect(calculateComplexity(createInitialTree("users")).label).toBe("Simple");
  });

  it("counts depth and logic switches for nested groups", () => {
    const result = calculateComplexity(nestedTree());
    expect(result.breakdown.depth).toBe(2);
    expect(result.breakdown.logicSwitches).toBe(1);
  });
});
