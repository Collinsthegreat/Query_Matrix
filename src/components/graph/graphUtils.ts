import dagre from "dagre";
import type { Edge, Node } from "reactflow";
import type { QueryNode, QueryTree } from "@/types/query";
import type { Schema } from "@/types/schema";
import { OPERATOR_LABELS } from "@/lib/constants";

export type GraphNodeData = {
  label: string;
  detail: string;
  kind: "rule" | "group";
  logic?: "AND" | "OR";
  fieldType?: string;
  matched: boolean | undefined;
  impactLabel?: string;
  impactPercentage?: number;
};

type GraphNode = Node<GraphNodeData>;

function labelForNode(node: QueryNode, schema?: Schema): GraphNodeData {
  if (node.type === "group") {
    return {
      label: node.id === "root" ? "Root group" : node.label ?? "Condition group",
      detail: `${node.logic} · ${node.children.length} children`,
      kind: "group",
      logic: node.logic,
      matched: undefined
    };
  }
  const field = schema?.fields.find((item) => item.key === node.field);
  return {
    label: (field?.label ?? node.field) || "Unselected field",
    detail: `${OPERATOR_LABELS[node.operator]} ${String(node.value ?? "")}`,
    kind: "rule",
    fieldType: field?.type,
    matched: undefined
  };
}

function walk(node: QueryNode, parentId: string | null, nodes: GraphNode[], edges: Edge[], schema?: Schema): void {
  nodes.push({
    id: node.id,
    type: node.type === "group" ? "groupNode" : "ruleNode",
    position: { x: 0, y: 0 },
    data: labelForNode(node, schema)
  });
  if (parentId) {
    const parent = nodes.find((candidate) => candidate.id === parentId);
    const logic = parent?.data.logic ?? "AND";
    edges.push({
      id: `${parentId}-${node.id}`,
      source: parentId,
      target: node.id,
      label: logic,
      type: "smoothstep",
      animated: false,
      style: {
        stroke: logic === "AND" ? "var(--logic-and)" : "var(--logic-or)",
        strokeWidth: 2,
        strokeDasharray: logic === "OR" ? "6 5" : undefined
      },
      labelStyle: { fill: logic === "AND" ? "var(--logic-and)" : "var(--logic-or)", fontWeight: 700 }
    });
  }
  if (node.type === "group") {
    node.children.forEach((child) => walk(child, node.id, nodes, edges, schema));
  }
}

export function treeToReactFlow(tree: QueryTree, schema?: Schema): { nodes: GraphNode[]; edges: Edge[] } {
  const nodes: GraphNode[] = [];
  const edges: Edge[] = [];
  walk(tree.root, null, nodes, edges, schema);
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "TB", nodesep: 42, ranksep: 82 });
  nodes.forEach((node) => graph.setNode(node.id, { width: node.data.kind === "group" ? 210 : 230, height: 86 }));
  edges.forEach((edge) => graph.setEdge(edge.source, edge.target));
  dagre.layout(graph);
  const laidOut = nodes.map((node) => {
    const position = graph.node(node.id) as { x: number; y: number } | undefined;
    return {
      ...node,
      position: {
        x: (position?.x ?? 0) - (node.data.kind === "group" ? 105 : 115),
        y: (position?.y ?? 0) - 43
      }
    };
  });
  return { nodes: laidOut, edges };
}
