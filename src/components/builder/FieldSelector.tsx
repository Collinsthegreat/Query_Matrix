"use client";

import * as React from "react";
import type { RuleNode } from "@/types/query";
import type { Schema } from "@/types/schema";
import { FIELD_TYPE_COLOR_VAR, OPERATORS_BY_TYPE, defaultValueForType } from "@/lib/constants";
import { getFieldStats, summarizeFieldStats } from "@/lib/fieldStats";
import { mockDatasets } from "@/components/simulator/mockDatasets";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Tooltip } from "@/components/ui/Tooltip";

export function FieldSelector({ rule, schema, onChange }: { rule: RuleNode; schema: Schema; onChange: (patch: Partial<RuleNode>) => void }) {
  const selected = schema.fields.find((field) => field.key === rule.field);
  const statsByField = React.useMemo(() => {
    const rows = mockDatasets[schema.id] ?? [];
    return new Map(schema.fields.map((field) => [field.key, getFieldStats(rows, field)]));
  }, [schema.fields, schema.id]);
  return (
    <div className="min-w-0">
      <label className="sr-only" htmlFor={`field-${rule.id}`}>Field</label>
      <Select
        value={rule.field}
        onValueChange={(fieldKey) => {
          const field = schema.fields.find((item) => item.key === fieldKey);
          if (!field) return;
          onChange({
            field: field.key,
            operator: OPERATORS_BY_TYPE[field.type][0],
            value: defaultValueForType(field.type),
            secondValue: undefined,
            error: null
          });
        }}
      >
        <SelectTrigger id={`field-${rule.id}`} aria-label="Select field">
          <SelectValue placeholder="Field">
            {selected ? (
              <span className="flex items-center gap-2">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ "--field-dot": FIELD_TYPE_COLOR_VAR[selected.type] } as React.CSSProperties & Record<"--field-dot", string>} />
                <span>{selected.label}</span>
              </span>
            ) : "Field"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {schema.fields.map((field) => (
            <SelectItem key={field.key} value={field.key}>
              <Tooltip
                content={(() => {
                  const stats = statsByField.get(field.key);
                  if (!stats) return `${field.type} field`;
                  return (
                    <div className="grid gap-1">
                      <div className="font-semibold">{field.label}</div>
                      <div>{summarizeFieldStats(stats)}</div>
                      <div className="text-[var(--text-secondary)]">Examples: {stats.examples.join(", ") || "none"}</div>
                    </div>
                  );
                })()}
              >
                <span className="flex w-full items-center gap-2">
                  <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[var(--field-dot)]" style={{ "--field-dot": FIELD_TYPE_COLOR_VAR[field.type] } as React.CSSProperties & Record<"--field-dot", string>} />
                  <span>{field.label}</span>
                  <span className="ml-auto text-xs text-[var(--text-muted)]">{field.type}</span>
                </span>
              </Tooltip>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
