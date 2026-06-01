"use client";

import { create } from "zustand";
import { temporal } from "zundo";
import type { LogicOperator, QueryTree, RuleNode } from "@/types/query";
import { createInitialTree, treeUtils } from "@/lib/treeUtils";

export type QueryStore = {
  tree: QueryTree;
  addRule: (parentId: string) => void;
  addGroup: (parentId: string) => void;
  removeNode: (nodeId: string) => void;
  updateRule: (nodeId: string, patch: Partial<RuleNode>) => void;
  updateGroupLogic: (nodeId: string, logic: LogicOperator) => void;
  toggleGroupCollapse: (nodeId: string) => void;
  moveNode: (nodeId: string, targetParentId: string, targetIndex: number) => void;
  clearAll: () => void;
  importTree: (tree: QueryTree) => void;
  setSchema: (schemaId: string) => void;
};

export const useQueryStore = create<QueryStore>()(
  temporal(
    (set) => ({
      tree: createInitialTree("users"),
      addRule: (parentId) => set((state) => ({ tree: treeUtils.addRule(state.tree, parentId) })),
      addGroup: (parentId) => set((state) => ({ tree: treeUtils.addGroup(state.tree, parentId) })),
      removeNode: (nodeId) => set((state) => ({ tree: treeUtils.removeNode(state.tree, nodeId) })),
      updateRule: (nodeId, patch) => set((state) => ({ tree: treeUtils.updateRule(state.tree, nodeId, patch) })),
      updateGroupLogic: (nodeId, logic) => set((state) => ({ tree: treeUtils.updateGroupLogic(state.tree, nodeId, logic) })),
      toggleGroupCollapse: (nodeId) => set((state) => ({ tree: treeUtils.toggleCollapse(state.tree, nodeId) })),
      moveNode: (nodeId, targetParentId, targetIndex) => set((state) => ({ tree: treeUtils.moveNode(state.tree, nodeId, targetParentId, targetIndex) })),
      clearAll: () => set((state) => ({ tree: createInitialTree(state.tree.schemaId) })),
      importTree: (tree) => set({ tree: { ...tree, version: tree.version + 1 } }),
      setSchema: (schemaId) => set({ tree: createInitialTree(schemaId) })
    }),
    {
      limit: 50,
      equality: (a, b) => JSON.stringify(a.tree) === JSON.stringify(b.tree)
    }
  )
);
