"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Sparkles } from "lucide-react";
import { analyzeQueryImpact } from "@/lib/queryImpact";
import { suggestOptimizations } from "@/lib/queryOptimizer";
import { detectConflicts } from "@/lib/validators";
import { treeUtils } from "@/lib/treeUtils";
import { mockDatasets } from "@/components/simulator/mockDatasets";
import { useQueryBuilder } from "@/hooks/useQueryBuilder";
import { useQueryStore } from "@/stores/queryStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { AccessibleQueryOutline } from "@/components/shared/AccessibleQueryOutline";
import { OptimizationSuggestions } from "@/components/shared/OptimizationSuggestions";
import { NaturalLanguageBar } from "@/components/ai/NaturalLanguageBar";
import { QueryGraph } from "@/components/graph/QueryGraph";
import { ConditionGroup } from "./ConditionGroup";

export function QueryBuilder() {
  const { tree, schema, validation } = useQueryBuilder();
  const addRule = useQueryStore((state) => state.addRule);
  const moveNode = useQueryStore((state) => state.moveNode);
  const removeNode = useQueryStore((state) => state.removeNode);
  const viewMode = useSettingsStore((state) => state.viewMode);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const errorsByNode = React.useMemo(() => new Map(validation.errors.map((error) => [error.nodeId, error.message])), [validation.errors]);
  const conflicts = React.useMemo(() => detectConflicts(tree, schema), [schema, tree]);
  const impactByNode = React.useMemo(() => analyzeQueryImpact(tree, mockDatasets[schema.id] ?? []), [schema.id, tree]);
  const suggestions = React.useMemo(() => suggestOptimizations(tree, schema), [schema, tree]);

  function onDragEnd(event: DragEndEvent): void {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    if (!overId || activeId === overId) return;
    const targetParent = treeUtils.findParent(tree, overId);
    if (!targetParent) return;
    const targetIndex = targetParent.children.findIndex((child) => child.id === overId);
    moveNode(activeId, targetParent.id, targetIndex < 0 ? targetParent.children.length : targetIndex);
  }

  return (
    <section id="query-builder" className="flex min-h-0 flex-1 flex-col gap-3" aria-label="Query builder">
      <NaturalLanguageBar />
      <OptimizationSuggestions suggestions={suggestions} onApply={(nodeId) => removeNode(nodeId)} />
      <AnimatePresence mode="wait">
        <motion.div
          key={schema.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-card)] p-3 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-2xl">{schema.icon}</span>
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)]">{schema.name}</h2>
                <p className="text-sm text-[var(--text-secondary)]">{schema.description}</p>
              </div>
            </div>
            <Badge tone="accent">{schema.fields.length} fields</Badge>
          </div>
        </motion.div>
      </AnimatePresence>
      <AccessibleQueryOutline tree={tree} schema={schema} />

      {viewMode === "graph" ? (
        <QueryGraph tree={tree} schema={schema} />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <div className="min-h-0 flex-1 overflow-auto pr-1">
            {tree.root.children.length === 0 && (
              <div className="mb-3">
                <span className="sr-only">Start with a rule or group</span>
                <EmptyState title="Start building your query" description="Use a rule, a nested group, or the natural language bar to shape a precise filter." actionLabel="Add your first rule →" onAction={() => addRule(tree.root.id)} />
              </div>
            )}
            <ConditionGroup node={tree.root} depth={0} parentId={null} isRoot schema={schema} errorsByNode={errorsByNode} conflicts={conflicts} impactByNode={impactByNode} />
          </div>
        </DndContext>
      )}
      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
        <Sparkles aria-hidden="true" size={14} />
        Recursive QueryNode rendering powers every nested condition.
      </div>
    </section>
  );
}
