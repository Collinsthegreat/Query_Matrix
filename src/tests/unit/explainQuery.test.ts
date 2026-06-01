import { describe, expect, it } from "vitest";
import { getSchemaById } from "@/lib/constants";
import { explainQuery } from "@/lib/explainQuery";
import { nestedTree, singleRuleTree } from "./testHelpers";

describe("explainQuery", () => {
  it("explains a single rule in plain English", () => {
    expect(explainQuery(singleRuleTree(), getSchemaById("users"))).toBe("Find users where age is greater than 18.");
  });

  it("preserves nested group logic in the explanation", () => {
    expect(explainQuery(nestedTree(), getSchemaById("users"))).toContain("(country equals NG OR total purchases is greater than 10)");
  });
});
