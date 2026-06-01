import type { Schema } from "./schema";

export type ResultRecord = Record<string, unknown>;

export type Dataset = {
  schemaId: Schema["id"];
  rows: ResultRecord[];
};

export type QueryExecutionResult = {
  results: ResultRecord[];
  executionTime: number;
  scannedRows: number;
  matchedRows: number;
};

export type SortDirection = "asc" | "desc";

export type ColumnSort = {
  key: string;
  direction: SortDirection;
};
