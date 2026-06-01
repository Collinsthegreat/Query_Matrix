"use client";

import * as React from "react";
import ReactFlow, { Background, Controls, MiniMap, type Node, type NodeTypes, type NodeMouseHandler } from "reactflow";
import "reactflow/dist/style.css";
import type { QueryTree } from "@/types/query";
import type { Schema } from "@/types/schema";
import { analyzeQueryImpact } from "@/lib/queryImpact";
import { treeUtils } from "@/lib/treeUtils";
import { mockDatasets } from "@/components/simulator/mockDatasets";
import { useHistoryStore } from "@/stores/historyStore";
import { useQueryStore } from "@/stores/queryStore";
import { treeToReactFlow, type GraphNodeData } from "./graphUtils";
import { GroupGraphNode } from "./GroupNode";
import { RuleGraphNode } from "./RuleNode";

const nodeTypes: NodeTypes = {
  ruleNode: RuleGraphNode,
  groupNode: GroupGraphNode
};

export function QueryGraph({ tree, schema }: { tree: QueryTree; schema: Schema }) {
  const nodeMatches = useHistoryStore((state) => state.nodeMatches);
  const setHighlightedNodeId = useHistoryStore((state) => state.setHighlightedNodeId);
  const moveNode = useQueryStore((state) => state.moveNode);
  const graph = React.useMemo(() => treeToReactFlow(tree, schema), [schema, tree]);
  const impactByNode = React.useMemo(() => analyzeQueryImpact(tree, mockDatasets[schema.id] ?? []), [schema.id, tree]);
  const nodes = React.useMemo(() => graph.nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      matched: nodeMatches[node.id],
      impactLabel: impactByNode[node.id]?.label,
      impactPercentage: impactByNode[node.id]?.percentage
    }
  })), [graph.nodes, impactByNode, nodeMatches]);
  const onNodeClick: NodeMouseHandler = React.useCallback((_, node) => setHighlightedNodeId(node.id), [setHighlightedNodeId]);

  function onNodeDragStop(_: React.MouseEvent, node: Node<GraphNodeData>): void {
    const currentParent = treeUtils.findParent(tree, node.id);
    if (!currentParent) return;
    const siblings: Array<Node<GraphNodeData>> = [];
    currentParent.children.forEach((child) => {
      const found = nodes.find((candidate) => candidate.id === child.id);
      if (found) siblings.push(found);
    });
    siblings.sort((a, b) => a.position.y - b.position.y);
    const index = siblings.findIndex((sibling) => sibling.id === node.id);
    if (index >= 0) moveNode(node.id, currentParent.id, index);
  }

  return (
    <div className="min-h-[520px] flex-1 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-card)]">
      <ReactFlow
        nodes={nodes}
        edges={graph.edges}
        nodeTypes={nodeTypes}
        fitView
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--border-hover)" gap={20} size={1} />
        <Controls position="top-left" showInteractive={false} />
        <MiniMap position="bottom-right" pannable zoomable nodeColor={(node) => node.type === "groupNode" ? "var(--accent)" : "var(--type-string)"} />
      </ReactFlow>
    </div>
  );
}
