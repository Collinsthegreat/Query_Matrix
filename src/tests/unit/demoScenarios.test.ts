import { describe, expect, it } from "vitest";
import { createBenchmarkDemoTree } from "@/lib/demoScenarios";
import { validateImportedQueryTree } from "@/lib/importValidation";

describe("demoScenarios", () => {
  it("creates a valid benchmark demo tree", () => {
    const tree = createBenchmarkDemoTree();
    const result = validateImportedQueryTree(tree);

    expect(result.valid).toBe(true);
    expect(tree.root.children.length).toBeGreaterThan(3);
  });
});
