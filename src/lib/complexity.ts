import type { GroupNode, LogicOperator, QueryNode, QueryTree } from "@/types/query";
import { treeUtils } from "./treeUtils";

export type ComplexityResult = {
  score: number;
  label: "Simple" | "Moderate" | "Complex" | "Expert";
  color: string;
  breakdown: {
    rules: number;
    groups: number;
    depth: number;
    logicSwitches: number;
  };
};

function maxDepth(node: QueryNode, depth: number): number {
  if (node.type === "rule" || node.children.length === 0) {
    return depth;
  }
  return Math.max(...node.children.map((child) => maxDepth(child, depth + 1)));
}

function countLogicSwitches(group: GroupNode, parentLogic: LogicOperator | null): number {
  const currentSwitch = parentLogic && parentLogic !== group.logic ? 1 : 0;
  return currentSwitch + group.children.reduce((total, child) => {
    return child.type === "group" ? total + countLogicSwitches(child, group.logic) : total;
  }, 0);
}

export function calculateComplexity(tree: QueryTree): ComplexityResult {
  const counts = treeUtils.countNodes(tree);
  const depth = maxDepth(tree.root, 0);
  const logicSwitches = countLogicSwitches(tree.root, null);
  const score = Math.min(100, counts.rules * 5 + counts.groups * 10 + depth * 15 + logicSwitches * 8);
  if (score <= 25) return { score, label: "Simple", color: "var(--success)", breakdown: { rules: counts.rules, groups: counts.groups, depth, logicSwitches } };
  if (score <= 50) return { score, label: "Moderate", color: "var(--warning)", breakdown: { rules: counts.rules, groups: counts.groups, depth, logicSwitches } };
  if (score <= 75) return { score, label: "Complex", color: "var(--complex)", breakdown: { rules: counts.rules, groups: counts.groups, depth, logicSwitches } };
  return { score, label: "Expert", color: "var(--danger)", breakdown: { rules: counts.rules, groups: counts.groups, depth, logicSwitches } };
}
