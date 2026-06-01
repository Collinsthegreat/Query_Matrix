"use client";

import type { LogicOperator } from "@/types/query";
import { cn } from "@/lib/utils";

export function LogicToggle({ value, onChange, disabled }: { value: LogicOperator; onChange: (value: LogicOperator) => void; disabled?: boolean }) {
  return (
    <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--bg-input)] p-1" role="radiogroup" aria-label="Group logic">
      {(["AND", "OR"] as const).map((logic) => (
        <button
          key={logic}
          type="button"
          disabled={disabled}
          role="radio"
          aria-checked={value === logic}
          className={cn(
            "min-h-8 rounded-full px-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
            value === logic && logic === "AND" && "bg-[var(--and-muted)] text-[var(--and-color)]",
            value === logic && logic === "OR" && "bg-[var(--or-muted)] text-[var(--or-color)]",
            value !== logic && "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
          onClick={() => onChange(logic)}
        >
          {logic}
        </button>
      ))}
    </div>
  );
}
