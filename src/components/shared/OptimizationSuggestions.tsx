"use client";

import { Lightbulb } from "lucide-react";
import type { OptimizationSuggestion } from "@/lib/queryOptimizer";
import { Button } from "@/components/ui/Button";

export function OptimizationSuggestions({ suggestions, onApply }: { suggestions: OptimizationSuggestion[]; onApply: (nodeId: string) => void }) {
  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-lg border border-[rgba(14,165,233,0.35)] bg-[rgba(14,165,233,0.1)] p-3" aria-label="Query simplification suggestions">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
        <Lightbulb aria-hidden="true" size={16} className="text-[var(--accent)]" />
        Simplification suggestions
      </div>
      <div className="grid gap-2">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-sm">
            <span className="text-[var(--text-secondary)]">{suggestion.message}</span>
            {suggestion.nodeId && suggestion.actionLabel && (
              <Button type="button" variant="secondary" size="sm" onClick={() => onApply(suggestion.nodeId!)}>
                {suggestion.actionLabel}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
