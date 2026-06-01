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
    "--dnd-transform": CSS.Transform.toString(transform) ?? "none",
    "--dnd-transition": transition ?? "var(--transition-base)"
  } as React.CSSProperties & Record<"--group-depth-color", string> & Record<"--dnd-transform", string> & Record<"--dnd-transition", string>;

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
        "sortable-row relative rounded-xl border border-[var(--border)] border-l-4 border-l-[var(--group-depth-color)] bg-[var(--bg-card)] p-4 shadow-sm",
        depth === 0 && "border-l-transparent",
        isDragging && "z-10 opacity-90 shadow-md"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!isRoot && (
            <button
              type="button"
              className="hidden h-9 w-8 cursor-grab items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] md:inline-flex"
              aria-label={`Drag to reorder group at depth ${depth}`}
              {...sortableAttributes}
              {...listeners}
            >
              <GripVertical aria-hidden="true" size={17} />
            </button>
          )}
          <Tooltip content={node.collapsed ? "Expand group" : "Collapse group"}>
            <Button type="button" variant="ghost" size="icon" aria-label={node.collapsed ? "Expand condition group" : "Collapse condition group"} onClick={() => toggleGroupCollapse(node.id)}>
              {node.collapsed ? <ChevronRight aria-hidden="true" size={16} /> : <ChevronDown aria-hidden="true" size={16} />}
            </Button>
          </Tooltip>
          <Badge tone={node.logic === "AND" ? "accent" : "default"}>{isRoot ? "Root" : `Depth ${depth}`}</Badge>
          {impact && <Badge tone="default">{impact.label}</Badge>}
          <LogicToggle value={node.logic} onChange={(logic) => updateGroupLogic(node.id, logic)} />
          <span className="text-sm text-[var(--text-secondary)]">{node.children.length} conditions</span>
        </div>
        {!isRoot && (
          <Tooltip content="Delete nested group">
            <Button type="button" variant="ghost" size="icon" aria-label="Delete condition group" onClick={() => removeNode(node.id)}>
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
            className="mt-3 space-y-2 overflow-hidden"
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

            <div className="flex flex-wrap gap-2 pt-2">
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
