"use client";

import { useMemo } from "react";
import { getSchemaById } from "@/lib/constants";
import { calculateComplexity } from "@/lib/complexity";
import { validateQuery } from "@/lib/validators";
import { treeUtils } from "@/lib/treeUtils";
import { useQueryStore } from "@/stores/queryStore";

export function useQueryBuilder() {
  const tree = useQueryStore((state) => state.tree);
  const schema = useMemo(() => getSchemaById(tree.schemaId), [tree.schemaId]);
  const validation = useMemo(() => validateQuery(tree, schema), [schema, tree]);
  const complexity = useMemo(() => calculateComplexity(tree), [tree]);
  const counts = useMemo(() => treeUtils.countNodes(tree), [tree]);
  const depth = useMemo(() => Math.max(...treeUtils.flattenTree(tree).map((node) => treeUtils.getDepth(tree, node.id))), [tree]);
  return { tree, schema, validation, complexity, counts, depth };
}

export function useCurrentSchema() {
  const schemaId = useQueryStore((state) => state.tree.schemaId);
  return useMemo(() => getSchemaById(schemaId), [schemaId]);
}
