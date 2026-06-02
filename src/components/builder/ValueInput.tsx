"use client";

import type { CSSProperties } from "react";
import type { RuleNode } from "@/types/query";
import type { Schema } from "@/types/schema";
import { FIELD_TYPE_COLOR_VAR } from "@/lib/constants";
import { Calendar } from "@/components/ui/Calendar";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

function toInputValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function parseNumber(value: string): number | "" {
  return value === "" ? "" : Number(value);
}

export function ValueInput({ rule, schema, onChange, errorId }: { rule: RuleNode; schema: Schema; onChange: (patch: Partial<RuleNode>) => void; errorId?: string }) {
  const field = schema.fields.find((item) => item.key === rule.field);
  const inputId = `value-${rule.id}`;
  const valueColorClass = field ? "text-[var(--value-color)]" : "";
  const valueStyle = field ? { "--value-color": FIELD_TYPE_COLOR_VAR[field.type] } as CSSProperties & Record<"--value-color", string> : undefined;
  if (!field || rule.operator === "is_null" || rule.operator === "is_not_null") {
    return <div className="min-h-10 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-input)] px-3 py-2.5 text-[var(--text-sm)] text-[var(--text-muted)]">No value needed</div>;
  }

  if (rule.operator === "between" || rule.operator === "date_between") {
    const dateMode = field.type === "date" || rule.operator === "date_between";
    return (
      <div className="grid min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-2">
        <label className="sr-only" htmlFor={inputId}>Start value</label>
        {dateMode ? (
          <Calendar id={inputId} className="text-[var(--type-date)]" value={toInputValue(rule.value)} onChange={(value) => onChange({ value })} aria-describedby={errorId} />
        ) : (
          <Input id={inputId} type="number" className="text-[var(--type-number)]" value={toInputValue(rule.value)} onChange={(event) => onChange({ value: parseNumber(event.target.value) })} aria-describedby={errorId} />
        )}
        <span className="text-xs text-[var(--text-secondary)]">and</span>
        <label className="sr-only" htmlFor={`${inputId}-second`}>End value</label>
        {dateMode ? (
          <Calendar id={`${inputId}-second`} className="text-[var(--type-date)]" value={toInputValue(rule.secondValue)} onChange={(value) => onChange({ secondValue: value })} aria-describedby={errorId} />
        ) : (
          <Input id={`${inputId}-second`} type="number" className="text-[var(--type-number)]" value={toInputValue(rule.secondValue)} onChange={(event) => onChange({ secondValue: parseNumber(event.target.value) })} aria-describedby={errorId} />
        )}
      </div>
    );
  }

  if (field.type === "boolean") {
    return (
      <div className="flex min-h-10 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-input)] p-1" role="radiogroup" aria-label={field.label} aria-describedby={errorId}>
        <Button type="button" variant={rule.value === true ? "primary" : "ghost"} size="sm" className="flex-1 text-[var(--type-boolean)] data-[active=true]:text-[var(--text-on-primary)]" data-active={rule.value === true} onClick={() => onChange({ value: true })}>Yes</Button>
        <Button type="button" variant={rule.value === false ? "primary" : "ghost"} size="sm" className="flex-1 text-[var(--type-boolean)] data-[active=true]:text-[var(--text-on-primary)]" data-active={rule.value === false} onClick={() => onChange({ value: false })}>No</Button>
      </div>
    );
  }

  if (field.type === "enum") {
    return (
      <div className="min-w-0">
        <label className="sr-only" htmlFor={inputId}>{field.label}</label>
        <Select value={toInputValue(rule.value)} onValueChange={(value) => onChange({ value })}>
          <SelectTrigger id={inputId} className="font-mono text-[var(--type-enum)]" aria-label={`Select ${field.label}`} aria-describedby={errorId}>
            <SelectValue placeholder={field.placeholder ?? "Choose value"} />
          </SelectTrigger>
          <SelectContent>
            {field.enumOptions?.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (field.type === "date") {
    return (
      <>
        <label className="sr-only" htmlFor={inputId}>{field.label}</label>
        <Calendar id={inputId} className="text-[var(--type-date)]" value={toInputValue(rule.value)} onChange={(value) => onChange({ value })} aria-describedby={errorId} />
      </>
    );
  }

  return (
    <>
      <label className="sr-only" htmlFor={inputId}>{field.label}</label>
      <Input
        id={inputId}
        type={field.type === "number" ? "number" : "text"}
        className={valueColorClass}
        style={valueStyle}
        min={field.min}
        max={field.max}
        placeholder={field.placeholder}
        value={toInputValue(rule.value)}
        onChange={(event) => onChange({ value: field.type === "number" ? parseNumber(event.target.value) : event.target.value })}
        aria-describedby={errorId}
      />
    </>
  );
}
