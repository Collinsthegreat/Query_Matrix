import { describe, expect, it } from "vitest";
import { createInitialTree, treeUtils } from "@/lib/treeUtils";
import { nestedTree, singleRuleTree } from "./testHelpers";

describe("treeUtils", () => {
  it("addRule appends rule to correct parent group", () => {
    const tree = treeUtils.addRule(createInitialTree("users"), "root");
    expect(tree.root.children).toHaveLength(1);
    expect(tree.root.children[0]?.type).toBe("rule");
  });

  it("addGroup appends group to correct parent", () => {
    const tree = treeUtils.addGroup(createInitialTree("users"), "root");
    expect(tree.root.children[0]?.type).toBe("group");
  });

  it("removeNode removes rule by id", () => {
    const tree = treeUtils.removeNode(singleRuleTree(), "r1");
    expect(tree.root.children).toHaveLength(0);
  });

  it("removeNode removes group and all children", () => {
    const tree = treeUtils.removeNode(nestedTree(), "g1");
    expect(treeUtils.findNode(tree, "r2")).toBeNull();
  });

  it("updateRule patches only the targeted rule", () => {
    const tree = treeUtils.updateRule(nestedTree(), "r2", { value: "US" });
    expect(treeUtils.findNode(tree, "r2")).toMatchObject({ value: "US" });
    expect(treeUtils.findNode(tree, "r1")).toMatchObject({ value: 18 });
  });

  it("updateRule does not mutate original tree", () => {
    const original = singleRuleTree();
    const updated = treeUtils.updateRule(original, "r1", { value: 40 });
    expect(treeUtils.findNode(original, "r1")).toMatchObject({ value: 18 });
    expect(treeUtils.findNode(updated, "r1")).toMatchObject({ value: 40 });
  });

  it("moveNode reorders correctly within same parent", () => {
    const tree = nestedTree();
    const moved = treeUtils.moveNode(tree, "g1", "root", 0);
    expect(moved.root.children[0]?.id).toBe("g1");
  });

  it("moveNode reorders group nodes among mixed siblings", () => {
    const tree = nestedTree();
    const moved = treeUtils.moveNode(tree, "g1", "root", 0);

    expect(moved.root.children.map((child) => child.id)).toEqual(["g1", "r1"]);
  });

  it("getDepth returns 0 for root", () => {
    expect(treeUtils.getDepth(nestedTree(), "root")).toBe(0);
  });

  it("getDepth returns correct depth for nested nodes", () => {
    expect(treeUtils.getDepth(nestedTree(), "r2")).toBe(2);
  });

  it("countNodes returns accurate rule and group counts", () => {
    expect(treeUtils.countNodes(nestedTree())).toEqual({ rules: 3, groups: 2, total: 5 });
  });
});
