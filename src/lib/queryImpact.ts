import type { QueryNode, QueryTree } from "@/types/query";
import type { ResultRecord } from "@/types/results";
import { nodeMatches, ruleMatches } from "./executor";

export type QueryImpact = {
  nodeId: string;
  matchedRows: number;
  eliminatedRows: number;
  totalRows: number;
  percentage: number;
  label: string;
};

export type QueryImpactMap = Record<string, QueryImpact>;

function matchesNode(node: QueryNode, record: ResultRecord): boolean {
  return node.type === "rule" ? ruleMatches(node, record) : nodeMatches(node, record);
}

function analyzeNode(node: QueryNode, dataset: ResultRecord[], output: QueryImpactMap): void {
  const matchedRows = dataset.filter((record) => matchesNode(node, record)).length;
  const totalRows = dataset.length;
  const percentage = totalRows === 0 ? 0 : Math.round((matchedRows / totalRows) * 100);
  output[node.id] = {
    nodeId: node.id,
    matchedRows,
    eliminatedRows: totalRows - matchedRows,
    totalRows,
    percentage,
    label: `keeps ${matchedRows}/${totalRows}`
  };
  if (node.type === "group") {
    node.children.forEach((child) => analyzeNode(child, dataset, output));
  }
}

export function analyzeQueryImpact(tree: QueryTree, dataset: ResultRecord[]): QueryImpactMap {
  const output: QueryImpactMap = {};
  analyzeNode(tree.root, dataset, output);
  return output;
}
