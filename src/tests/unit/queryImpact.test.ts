import { describe, expect, it } from "vitest";
import { analyzeQueryImpact } from "@/lib/queryImpact";
import { singleRuleTree } from "./testHelpers";

describe("queryImpact", () => {
  it("calculates retained rows for each query node", () => {
    const tree = singleRuleTree({ field: "age", operator: "greater_than", value: 20 });
    const impact = analyzeQueryImpact(tree, [
      { age: 18 },
      { age: 22 },
      { age: 30 }
    ]);

    expect(impact.r1?.matchedRows).toBe(2);
    expect(impact.r1?.label).toBe("keeps 2/3");
    expect(impact.root?.percentage).toBe(67);
  });
});
