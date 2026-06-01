import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "success" | "warning" | "danger" | "accent";
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
        tone === "default" && "border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-secondary)]",
        tone === "success" && "border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.12)] text-[var(--success)]",
        tone === "warning" && "border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.12)] text-[var(--warning)]",
        tone === "danger" && "border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.12)] text-[var(--danger)]",
        tone === "accent" && "border-[var(--border-accent)] bg-[var(--accent-muted)] text-[var(--text-accent)]",
        className
      )}
      {...props}
    />
  );
}
