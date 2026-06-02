"use client";

import type { LogicOperator } from "@/types/query";
import { cn } from "@/lib/utils";

export function LogicToggle({ value, onChange, disabled }: { value: LogicOperator; onChange: (value: LogicOperator) => void; disabled?: boolean }) {
  return (
    <div className="inline-flex gap-0.5 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-app)] p-0.5" role="radiogroup" aria-label="Group logic">
      {(["AND", "OR"] as const).map((logic) => (
        <button
          key={logic}
          type="button"
          disabled={disabled}
          role="radio"
          aria-checked={value === logic}
          className={cn(
            "min-h-7 rounded-[var(--radius-xs)] border-0 px-3 font-mono text-[var(--text-xs)] font-bold tracking-[0.05em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
            value === logic && logic === "AND" && "bg-[var(--logic-and)] text-[var(--logic-and-text)]",
            value === logic && logic === "OR" && "bg-[var(--logic-or)] text-[var(--logic-or-text)]",
            value !== logic && "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          )}
          onClick={() => onChange(logic)}
        >
          {logic}
        </button>
      ))}
    </div>
  );
}
