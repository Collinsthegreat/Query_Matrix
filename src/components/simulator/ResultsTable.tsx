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

function statusClasses(value: unknown): string | null {
  const normalized = String(value ?? "").toLowerCase();
  if (["active", "paid"].includes(normalized)) return "border-[var(--success-border)] bg-[var(--success-muted)] text-[var(--success)]";
  if (["inactive", "banned", "cancelled", "failed"].includes(normalized)) return "border-[var(--danger-border)] bg-[var(--danger-muted)] text-[var(--danger)]";
  if (["pending", "draft"].includes(normalized)) return "border-[var(--warning-border)] bg-[var(--warning-muted)] text-[var(--warning)]";
  if (["shipped", "processing"].includes(normalized)) return "border-[var(--info-border)] bg-[var(--info-muted)] text-[var(--info)]";
  return null;
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
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-3" aria-label="Loading results">
        <div className="grid gap-2">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="h-10 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)]" style={{ animation: `shimmer 1.4s ease-in-out ${index * 80}ms infinite` }} />
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState title="No rows match" description="Adjust your query conditions or switch logic from AND to OR." />;
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-panel)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2.5">
        <span className="rounded-[var(--radius-sm)] border border-[var(--primary-border)] bg-[var(--primary-muted)] px-2.5 py-1 font-mono text-[var(--text-xs)] font-semibold text-[var(--primary)]">{rows.length} / {scannedRows} rows matched</span>
        <Button type="button" variant="secondary" size="sm" onClick={exportCsv}>
          <Download aria-hidden="true" size={15} />
          Export CSV
        </Button>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full table-fixed border-collapse text-[var(--text-sm)]" role="grid">
          <thead className="bg-[var(--bg-elevated)]">
            <tr>
              {schema.fields.map((field) => (
                <th key={field.key} scope="col" aria-sort={sort?.key === field.key ? (sort.direction === "asc" ? "ascending" : "descending") : "none"} className={cn("whitespace-nowrap border-b border-[var(--border-default)] px-3.5 py-2 text-left text-[var(--text-xs)] font-medium uppercase tracking-[0.07em] text-[var(--text-muted)]", sort?.key === field.key && "text-[var(--primary)]")}>
                  <button type="button" className="inline-flex min-h-7 items-center gap-1 rounded hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]" onClick={() => toggleSort(field.key)}>
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
                  className={cn(
                    "border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--bg-elevated)]",
                    rowIndex % 2 === 1 && "bg-[rgba(255,255,255,0.01)]",
                    !replayFrame && "bg-[rgba(34,197,94,0.035)]",
                    isAdded && "bg-[var(--info-muted)]"
                  )}
                >
                  {schema.fields.map((field) => {
                    const value = row[field.key];
                    const chipClass = statusClasses(value);
                    return (
                      <td
                        key={field.key}
                        className={cn(
                          "whitespace-nowrap px-3.5 py-2 text-[var(--text-primary)]",
                          field.type === "number" && "font-mono text-[var(--type-number)]",
                          field.type === "date" && "font-mono text-[var(--type-date)]",
                          field.type === "boolean" && "font-mono",
                          matched.has(field.key) && "bg-[rgba(34,197,94,0.13)]"
                        )}
                      >
                        {chipClass ? (
                          <span className={cn("inline-flex items-center rounded-[var(--radius-xs)] border px-2 py-0.5 font-mono text-[var(--text-xs)] font-medium", chipClass)}>{String(value ?? "")}</span>
                        ) : (
                          <span className={cn(field.type === "boolean" && (value ? "text-[var(--success)]" : "text-[var(--danger)]"))}>{String(value ?? "")}</span>
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2 font-mono text-[var(--text-xs)] text-[var(--text-muted)]">
        <Button type="button" variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>Previous</Button>
        <span>Page <span className="text-[var(--text-secondary)]">{page + 1}</span> of <span className="text-[var(--text-secondary)]">{pageCount}</span></span>
        <Button type="button" variant="secondary" size="sm" disabled={page + 1 >= pageCount} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}>Next</Button>
      </div>
    </div>
  );
}
