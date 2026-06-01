import { describe, expect, it } from "vitest";
import { getSchemaById } from "@/lib/constants";
import { buildReplayFrames } from "@/lib/queryReplay";
import { nestedTree, singleRuleTree } from "./testHelpers";

describe("queryReplay", () => {
  it("creates one replay frame per rule", () => {
    const frames = buildReplayFrames(nestedTree(), getSchemaById("users"), [
      { age: 19, country: "NG", purchases: 0 },
      { age: 16, country: "US", purchases: 50 }
    ]);

    expect(frames).toHaveLength(3);
    expect(frames[0]?.totalSteps).toBe(3);
  });

  it("tracks rows removed by each replay frame", () => {
    const frames = buildReplayFrames(singleRuleTree({ field: "age", operator: "greater_than", value: 18 }), getSchemaById("users"), [
      { email: "a@test.com", age: 16 },
      { email: "b@test.com", age: 22 }
    ]);

    expect(frames[0]?.removedKeys.size).toBe(1);
    expect(frames[0]?.rowsAfter).toHaveLength(1);
  });
});
