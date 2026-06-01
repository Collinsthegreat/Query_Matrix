import { nanoid } from "nanoid";
import type { GroupNode, LogicOperator, QueryNode, QueryTree, RuleNode } from "@/types/query";
import { DEFAULT_SCHEMA_ID } from "./constants";

function createRule(): RuleNode {
  return {
    type: "rule",
    id: nanoid(),
    field: "",
    operator: "equals",
    value: ""
  };
}

function createGroup(label?: string): GroupNode {
  return {
    type: "group",
    id: nanoid(),
    logic: "AND",
    children: [],
    collapsed: false,
    label
  };
}

export function createInitialTree(schemaId: string = DEFAULT_SCHEMA_ID): QueryTree {
  return {
    root: {
      type: "group",
      id: "root",
      logic: "AND",
      children: [],
      collapsed: false,
      label: "Root group"
    },
    version: 1,
    schemaId
  };
}

function bump(tree: QueryTree, root: GroupNode): QueryTree {
  return { ...tree, root, version: tree.version + 1 };
}

function updateGroup(root: GroupNode, targetId: string, update: (group: GroupNode) => GroupNode): GroupNode {
  if (root.id === targetId) {
    return update(root);
  }
  return {
    ...root,
    children: root.children.map((child) => child.type === "group" ? updateGroup(child, targetId, update) : child)
  };
}

function updateNode(node: QueryNode, targetId: string, update: (node: QueryNode) => QueryNode): QueryNode {
  if (node.id === targetId) {
    return update(node);
  }
  if (node.type === "rule") {
    return node;
  }
  return {
    ...node,
    children: node.children.map((child) => updateNode(child, targetId, update))
  };
}

function removeFromGroup(group: GroupNode, nodeId: string): GroupNode {
  return {
    ...group,
    children: group.children
      .filter((child) => child.id !== nodeId)
      .map((child) => child.type === "group" ? removeFromGroup(child, nodeId) : child)
  };
}

function detachNode(group: GroupNode, nodeId: string): { group: GroupNode; detached: QueryNode | null } {
  let detached: QueryNode | null = null;
  const children = group.children.flatMap<QueryNode>((child) => {
    if (child.id === nodeId) {
      detached = child;
      return [];
    }
    if (child.type === "group") {
      const result = detachNode(child, nodeId);
      if (result.detached) detached = result.detached;
      return [result.group];
    }
    return [child];
  });
  return { group: { ...group, children }, detached };
}

function insertNode(group: GroupNode, parentId: string, index: number, node: QueryNode): GroupNode {
  if (group.id === parentId) {
    const nextChildren = [...group.children];
    nextChildren.splice(Math.max(0, Math.min(index, nextChildren.length)), 0, node);
    return { ...group, children: nextChildren };
  }
  return {
    ...group,
    children: group.children.map((child) => child.type === "group" ? insertNode(child, parentId, index, node) : child)
  };
}

function collectNodes(node: QueryNode, output: QueryNode[]): void {
  output.push(node);
  if (node.type === "group") {
    node.children.forEach((child) => collectNodes(child, output));
  }
}

function getNodeDepth(node: QueryNode, nodeId: string, depth: number): number | null {
  if (node.id === nodeId) {
    return depth;
  }
  if (node.type === "rule") {
    return null;
  }
  for (const child of node.children) {
    const childDepth = getNodeDepth(child, nodeId, depth + 1);
    if (childDepth !== null) {
      return childDepth;
    }
  }
  return null;
}

export const treeUtils = {
  addRule(tree: QueryTree, parentId: string): QueryTree {
    return bump(tree, updateGroup(tree.root, parentId, (group) => ({ ...group, children: [...group.children, createRule()] })));
  },
  addGroup(tree: QueryTree, parentId: string): QueryTree {
    return bump(tree, updateGroup(tree.root, parentId, (group) => ({ ...group, children: [...group.children, createGroup("Nested group")] })));
  },
  removeNode(tree: QueryTree, nodeId: string): QueryTree {
    if (nodeId === tree.root.id) return tree;
    return bump(tree, removeFromGroup(tree.root, nodeId));
  },
  updateRule(tree: QueryTree, nodeId: string, patch: Partial<RuleNode>): QueryTree {
    const root = updateNode(tree.root, nodeId, (node) => node.type === "rule" ? { ...node, ...patch, id: node.id, type: "rule" } : node);
    return root.type === "group" ? bump(tree, root) : tree;
  },
  updateGroupLogic(tree: QueryTree, nodeId: string, logic: LogicOperator): QueryTree {
    return bump(tree, updateGroup(tree.root, nodeId, (group) => ({ ...group, logic })));
  },
  toggleCollapse(tree: QueryTree, nodeId: string): QueryTree {
    return bump(tree, updateGroup(tree.root, nodeId, (group) => ({ ...group, collapsed: !group.collapsed })));
  },
  moveNode(tree: QueryTree, nodeId: string, targetParentId: string, index: number): QueryTree {
    if (nodeId === tree.root.id || nodeId === targetParentId) return tree;
    const target = this.findNode(tree, targetParentId);
    if (!target || target.type !== "group") return tree;
    const { group, detached } = detachNode(tree.root, nodeId);
    if (!detached) return tree;
    return bump(tree, insertNode(group, targetParentId, index, detached));
  },
  findNode(tree: QueryTree, nodeId: string): QueryNode | null {
    return this.flattenTree(tree).find((node) => node.id === nodeId) ?? null;
  },
  findParent(tree: QueryTree, nodeId: string): GroupNode | null {
    function visit(group: GroupNode): GroupNode | null {
      if (group.children.some((child) => child.id === nodeId)) return group;
      for (const child of group.children) {
        if (child.type === "group") {
          const parent = visit(child);
          if (parent) return parent;
        }
      }
      return null;
    }
    return visit(tree.root);
  },
  flattenTree(tree: QueryTree): QueryNode[] {
    const nodes: QueryNode[] = [];
    collectNodes(tree.root, nodes);
    return nodes;
  },
  getDepth(tree: QueryTree, nodeId: string): number {
    return getNodeDepth(tree.root, nodeId, 0) ?? -1;
  },
  countNodes(tree: QueryTree): { rules: number; groups: number; total: number } {
    const nodes = this.flattenTree(tree);
    const rules = nodes.filter((node) => node.type === "rule").length;
    const groups = nodes.filter((node) => node.type === "group").length;
    return { rules, groups, total: rules + groups };
  }
};
