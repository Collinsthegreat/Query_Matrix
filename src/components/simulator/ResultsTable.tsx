"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Download } from "lucide-react";
import type { QueryTree } from "@/types/query";
import type { Schema } from "@/types/schema";
import type { ColumnSort, ResultRecord } from "@/types/results";
import { matchingFieldKeys } from "@/lib/executor";
import type { ReplayFrame } from "@/lib/queryReplay";
import { replayRowKey } from "@/lib/queryReplay";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a ?? "").localeCompare(String(b ?? ""));
}

function csvValue(value: unknown): string {
  const text = String(value ?? "");
  return `"${text.replaceAll("\"", "\"\"")}"`;
}

export function ResultsTable({ rows, schema, tree, loading, scannedRows, replayFrame }: { rows: ResultRecord[]; schema: Schema; tree: QueryTree; loading: boolean; scannedRows: number; replayFrame?: ReplayFrame | null }) {
  const [sort, setSort] = React.useState<ColumnSort | null>(null);
  const [page, setPage] = React.useState(0);
  const sortedRows = React.useMemo(() => {
    if (!sort) return rows;
    return [...rows].sort((a, b) => {
      const direction = sort.direction === "asc" ? 1 : -1;
      return compareValues(a[sort.key], b[sort.key]) * direction;
    });
  }, [rows, sort]);
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const visibleRows = sortedRows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  React.useEffect(() => {
    setPage((current) => Math.min(current, pageCount - 1));
  }, [pageCount]);

  function toggleSort(key: string): void {
    setPage(0);
    setSort((current) => current?.key === key
      ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
      : { key, direction: "asc" });
  }

  function exportCsv(): void {
    const header = schema.fields.map((field) => csvValue(field.label)).join(",");
    const body = rows.map((row) => schema.fields.map((field) => csvValue(row[field.key])).join(",")).join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${schema.id}-query-results.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="space-y-2" aria-label="Loading results">
        {Array.from({ length: 10 }, (_, index) => <div key={index} className="h-10 animate-pulse rounded bg-[linear-gradient(90deg,var(--bg-input),var(--bg-card-hover),var(--bg-input))] bg-[length:200%_100%]" />)}
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState title="No records match your query" description="Try widening the filters or switching logic from AND to OR." />;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge tone="accent">Showing {rows.length} of {scannedRows} records</Badge>
        <Button type="button" variant="secondary" size="sm" onClick={exportCsv}>
          <Download aria-hidden="true" size={15} />
          Export CSV
        </Button>
      </div>
      <div className="overflow-auto rounded border border-[var(--border)]">
        <table className="min-w-full border-collapse text-sm" role="grid">
          <thead className="bg-[var(--bg-input)]">
            <tr>
              {schema.fields.map((field) => (
                <th key={field.key} scope="col" aria-sort={sort?.key === field.key ? (sort.direction === "asc" ? "ascending" : "descending") : "none"} className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 text-left font-semibold text-[var(--text-secondary)]">
                  <button type="button" className="inline-flex min-h-8 items-center gap-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" onClick={() => toggleSort(field.key)}>
                    {field.label}
                    {sort?.key === field.key && (sort.direction === "asc" ? <ArrowUp aria-hidden="true" size={13} /> : <ArrowDown aria-hidden="true" size={13} />)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
            {visibleRows.map((row, rowIndex) => {
              const matched = matchingFieldKeys(tree, row);
              const absoluteIndex = page * PAGE_SIZE + rowIndex;
              const rowKey = replayRowKey(row, schema, absoluteIndex);
              const isAdded = replayFrame?.addedKeys.has(rowKey);
              return (
                <motion.tr
                  key={rowKey}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 18 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  className={cn("hover:bg-[var(--bg-card-hover)]", isAdded && "bg-[rgba(59,130,246,0.12)]")}
                >
                  {schema.fields.map((field) => (
                    <td
                      key={field.key}
                      className={cn(
                        "whitespace-nowrap border-b border-[var(--border)] px-3 py-2 text-[var(--text-primary)]",
                        matched.has(field.key) && "bg-[rgba(34,197,94,0.14)]"
                      )}
                    >
                      {String(row[field.key] ?? "")}
                    </td>
                  ))}
                </motion.tr>
              );
            })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>Previous</Button>
        <span className="text-xs text-[var(--text-secondary)]">Page {page + 1} of {pageCount}</span>
        <Button type="button" variant="secondary" size="sm" disabled={page + 1 >= pageCount} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}>Next</Button>
      </div>
    </div>
  );
}
