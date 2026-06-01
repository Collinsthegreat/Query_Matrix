"use client";

import { nanoid } from "nanoid";
import { executeQuery, ruleMatchMap } from "@/lib/executor";
import { validateQuery } from "@/lib/validators";
import { useQueryBuilder } from "@/hooks/useQueryBuilder";
import { useHistoryStore, summarizeResult } from "@/stores/historyStore";
import { useToastStore } from "@/stores/toastStore";
import { mockDatasets } from "@/components/simulator/mockDatasets";
import type { QueryTree } from "@/types/query";
import type { Schema } from "@/types/schema";

type RunOverride = {
  tree: QueryTree;
  schema: Schema;
};

export function useRunQuery() {
  const { tree, schema } = useQueryBuilder();
  const addRun = useHistoryStore((state) => state.addRun);
  const pushToast = useToastStore((state) => state.pushToast);

  return async function runQuery(override?: RunOverride): Promise<void> {
    const targetTree = override?.tree ?? tree;
    const targetSchema = override?.schema ?? schema;
    const validation = validateQuery(targetTree, targetSchema);
    if (!validation.valid) {
      pushToast({ title: "Fix validation errors", description: validation.errors[0]?.message ?? "The current query cannot run yet.", tone: "error" });
      return;
    }
    const dataset = mockDatasets[targetSchema.id] ?? [];
    const delay = 200 + Math.floor(Math.random() * 401);
    await new Promise((resolve) => window.setTimeout(resolve, delay));
    const result = executeQuery(targetTree, dataset, targetSchema);
    const matches = ruleMatchMap(targetTree, result.results);
    addRun({
      id: nanoid(),
      schemaId: targetSchema.id,
      createdAt: new Date().toISOString(),
      summary: summarizeResult(result, dataset),
      result
    }, matches);
    pushToast({ title: "Query run complete", description: summarizeResult(result, dataset), tone: "success" });
  };
}
