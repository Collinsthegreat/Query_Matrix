import type { ResultRecord } from "@/types/results";
import type { SchemaField } from "@/types/schema";

export type FieldStats = {
  totalRows: number;
  nullCount: number;
  uniqueCount: number;
  examples: string[];
  min?: number | string;
  max?: number | string;
  mean?: number;
};

function present(value: unknown): boolean {
  return value !== null && value !== undefined && value !== "";
}

function display(value: unknown): string {
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

export function getFieldStats(rows: ResultRecord[], field: SchemaField): FieldStats {
  const values = rows.map((row) => row[field.key]);
  const presentValues = values.filter(present);
  const examples = Array.from(new Set(presentValues.map(display))).slice(0, 4);
  const stats: FieldStats = {
    totalRows: rows.length,
    nullCount: values.length - presentValues.length,
    uniqueCount: new Set(presentValues.map(display)).size,
    examples
  };

  if (field.type === "number") {
    const numeric = presentValues.map(Number).filter((value) => !Number.isNaN(value));
    if (numeric.length > 0) {
      stats.min = Math.min(...numeric);
      stats.max = Math.max(...numeric);
      stats.mean = Number((numeric.reduce((sum, value) => sum + value, 0) / numeric.length).toFixed(1));
    }
  }

  if (field.type === "date") {
    const sorted = presentValues.map(display).sort();
    stats.min = sorted[0];
    stats.max = sorted[sorted.length - 1];
  }

  return stats;
}

export function summarizeFieldStats(stats: FieldStats): string {
  const range = stats.min !== undefined && stats.max !== undefined ? ` · ${stats.min} to ${stats.max}` : "";
  const mean = stats.mean !== undefined ? ` · mean ${stats.mean}` : "";
  return `${stats.uniqueCount} unique · ${stats.nullCount} empty${range}${mean}`;
}
