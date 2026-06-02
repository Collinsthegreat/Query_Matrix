"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { Conflict } from "@/lib/validators";
import { Button } from "@/components/ui/Button";

export function ConflictWarning({ conflict }: { conflict: Conflict }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--warning-border)] bg-[var(--warning-muted)] p-3 text-sm text-[var(--text-primary)]" role="alert">
      <div className="flex flex-wrap items-center gap-2">
        <AlertTriangle aria-hidden="true" size={16} className="text-[var(--warning)]" />
        <span className="font-semibold">{conflict.message}</span>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-[var(--warning)]" onClick={() => setOpen((current) => !current)}>
          Learn why →
        </Button>
      </div>
      {open && <p className="mt-2 text-[var(--text-secondary)]">{conflict.explanation}</p>}
    </div>
  );
}
