"use client";

import type { Operator, RuleNode } from "@/types/query";
import type { Schema } from "@/types/schema";
import { OPERATOR_LABELS, OPERATORS_BY_TYPE } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

export function OperatorSelector({ rule, schema, onChange }: { rule: RuleNode; schema: Schema; onChange: (operator: Operator) => void }) {
  const field = schema.fields.find((item) => item.key === rule.field);
  const operators = field ? OPERATORS_BY_TYPE[field.type] : (["equals"] satisfies Operator[]);
  return (
    <div className="min-w-0">
      <label className="sr-only" htmlFor={`operator-${rule.id}`}>Operator</label>
      <Select value={rule.operator} onValueChange={(value) => onChange(value as Operator)}>
        <SelectTrigger id={`operator-${rule.id}`} aria-label="Select operator">
          <SelectValue>{OPERATOR_LABELS[rule.operator]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {operators.map((operator) => (
            <SelectItem key={operator} value={operator}>{OPERATOR_LABELS[operator]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
