import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "success" | "warning" | "danger" | "accent";
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1 rounded-[var(--radius-sm)] border px-2 py-0.5 font-mono text-[var(--text-xs)] font-semibold leading-none",
        tone === "default" && "border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-secondary)]",
        tone === "success" && "border-[var(--success-border)] bg-[var(--success-muted)] text-[var(--success)]",
        tone === "warning" && "border-[var(--warning-border)] bg-[var(--warning-muted)] text-[var(--warning)]",
        tone === "danger" && "border-[var(--danger-border)] bg-[var(--danger-muted)] text-[var(--danger)]",
        tone === "accent" && "border-[var(--primary-border)] bg-[var(--primary-muted)] text-[var(--primary)]",
        className
      )}
      {...props}
    />
  );
}
