"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, GripVertical, Trash2 } from "lucide-react";
import type { GroupNode } from "@/types/query";
import type { Schema } from "@/types/schema";
import type { QueryImpactMap } from "@/lib/queryImpact";
import type { Conflict } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { useQueryStore } from "@/stores/queryStore";
import { AddGroupButton, AddRuleButton } from "./AddRuleButton";
import { LogicToggle } from "./LogicToggle";
import { RuleRow } from "./RuleRow";
import { ConflictWarning } from "../shared/ConflictWarning";

type Props = {
  node: GroupNode;
  depth: number;
  parentId: string | null;
  isRoot?: boolean;
  schema: Schema;
  errorsByNode: Map<string, string>;
  conflicts: Conflict[];
  impactByNode?: QueryImpactMap;
};

function depthVar(depth: number): string {
  return `var(--depth-${Math.min(depth, 5)})`;
}

export const ConditionGroup = React.memo(({ node, depth, parentId, isRoot = false, schema, errorsByNode, conflicts, impactByNode = {} }: Props) => {
  const addRule = useQueryStore((state) => state.addRule);
  const addGroup = useQueryStore((state) => state.addGroup);
  const removeNode = useQueryStore((state) => state.removeNode);
  const updateGroupLogic = useQueryStore((state) => state.updateGroupLogic);
  const toggleGroupCollapse = useQueryStore((state) => state.toggleGroupCollapse);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: node.id, disabled: isRoot });
  const groupConflicts = conflicts.filter((conflict) => conflict.groupId === node.id);
  const impact = impactByNode[node.id];
  const sortableAttributes = { ...attributes, "aria-roledescription": "sortable group" };
  const groupStyle = {
    "--group-depth-color": depth > 0 ? depthVar(depth) : "transparent",
    "--group-depth-bg": depth > 0 ? `var(--depth-${Math.min(depth, 5)}-bg)` : "var(--bg-panel)",
    "--dnd-transform": CSS.Transform.toString(transform) ?? "none",
    "--dnd-transition": transition ?? "var(--transition-base)"
  } as React.CSSProperties & Record<"--group-depth-color", string> & Record<"--group-depth-bg", string> & Record<"--dnd-transform", string> & Record<"--dnd-transition", string>;

  return (
    <motion.div
      ref={setNodeRef}
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      role="group"
      aria-label={`Condition group, ${node.logic} logic`}
      style={groupStyle}
      className={cn(
        "sortable-row group/condition relative overflow-hidden border shadow-sm transition",
        isRoot
          ? "rounded-[var(--radius-xl)] border-[var(--border-default)] border-l-[var(--border-default)] bg-[var(--bg-panel)]"
          : "my-1.5 rounded-r-[var(--radius-md)] border-[var(--border-subtle)] border-l-[3px] border-l-[var(--group-depth-color)] bg-[var(--group-depth-bg)]",
        isDragging && "z-10 opacity-90 shadow-md"
      )}
    >
      <div className="flex min-h-10 flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2">
        <div className="flex items-center gap-2">
          {!isRoot && (
            <button
              type="button"
              className="hidden h-6 w-6 cursor-grab items-center justify-center rounded-[var(--radius-xs)] text-[var(--text-muted)] transition hover:border hover:border-[var(--border-strong)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] md:inline-flex"
              aria-label={`Drag to reorder group at depth ${depth}`}
              {...sortableAttributes}
              {...listeners}
            >
              <GripVertical aria-hidden="true" size={17} />
            </button>
          )}
          <Tooltip content={node.collapsed ? "Expand group" : "Collapse group"}>
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--border-strong)]" aria-label={node.collapsed ? "Expand condition group" : "Collapse condition group"} onClick={() => toggleGroupCollapse(node.id)}>
              {node.collapsed ? <ChevronRight aria-hidden="true" size={16} /> : <ChevronDown aria-hidden="true" size={16} />}
            </Button>
          </Tooltip>
          <Badge tone={node.logic === "AND" ? "accent" : "warning"}>{isRoot ? "Root" : `Depth ${depth}`}</Badge>
          {impact && <Badge tone="default" className="impact-count">{impact.label}</Badge>}
          <LogicToggle value={node.logic} onChange={(logic) => updateGroupLogic(node.id, logic)} />
          <span className="text-[var(--text-xs)] text-[var(--text-muted)]"><span className="font-mono text-[var(--text-primary)]">{node.children.length}</span> conditions</span>
        </div>
        {!isRoot && (
          <Tooltip content="Delete nested group">
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 border border-[var(--danger-border)] bg-[var(--danger-muted)] text-[var(--danger)] opacity-0 transition-opacity group-hover/condition:opacity-100" aria-label="Delete condition group" onClick={() => removeNode(node.id)}>
              <Trash2 aria-hidden="true" size={16} />
            </Button>
          </Tooltip>
        )}
      </div>

      <AnimatePresence initial={false}>
        {!node.collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="space-y-1.5 overflow-hidden px-3 py-2.5"
          >
            <SortableContext items={node.children.map((child) => child.id)} strategy={verticalListSortingStrategy}>
              {node.children.map((child) => child.type === "rule" ? (
                <RuleRow key={child.id} node={child} parentId={node.id} schema={schema} error={errorsByNode.get(child.id)} impact={impactByNode[child.id]} />
              ) : (
                <ConditionGroup
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  parentId={node.id}
                  schema={schema}
                  errorsByNode={errorsByNode}
                  conflicts={conflicts}
                  impactByNode={impactByNode}
                />
              ))}
            </SortableContext>

            {groupConflicts.map((conflict) => <ConflictWarning key={`${conflict.groupId}-${conflict.explanation}`} conflict={conflict} />)}

            <div className="flex flex-wrap gap-2 pt-1">
              <AddRuleButton onClick={() => addRule(node.id)} />
              <AddGroupButton onClick={() => addGroup(node.id)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
ConditionGroup.displayName = "ConditionGroup";
