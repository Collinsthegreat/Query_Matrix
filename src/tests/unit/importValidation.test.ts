import { describe, expect, it } from "vitest";
import { validateImportedQueryTree } from "@/lib/importValidation";
import { singleRuleTree } from "./testHelpers";

describe("validateImportedQueryTree", () => {
  it("accepts and normalizes a valid imported tree", () => {
    const payload = singleRuleTree();
    const result = validateImportedQueryTree(payload);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.tree.root.id).toBe("root");
      expect(result.tree.schemaId).toBe("users");
    }
  });

  it("rejects malformed JSON import payloads", () => {
    const result = validateImportedQueryTree("not a tree");

    expect(result.valid).toBe(false);
  });

  it("rejects unknown schemas", () => {
    const payload = { ...singleRuleTree(), schemaId: "missing-schema" };

    const result = validateImportedQueryTree(payload);

    expect(result.valid).toBe(false);
  });

  it("rejects unknown fields", () => {
    const payload = singleRuleTree({ field: "missingField" });

    const result = validateImportedQueryTree(payload);

    expect(result.valid).toBe(false);
  });

  it("rejects invalid operators for a field type", () => {
    const payload = singleRuleTree({ field: "age", operator: "contains", value: "20" });

    const result = validateImportedQueryTree(payload);

    expect(result.valid).toBe(false);
  });

  it("rejects malformed recursive group structures", () => {
    const payload = {
      ...singleRuleTree(),
      root: {
        type: "group",
        id: "root",
        logic: "AND",
        collapsed: false,
        children: [{ type: "group", id: "g1", logic: "AND" }]
      }
    };

    const result = validateImportedQueryTree(payload);

    expect(result.valid).toBe(false);
  });
});
