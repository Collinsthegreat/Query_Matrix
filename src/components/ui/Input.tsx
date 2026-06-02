"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-input)] px-3 font-mono text-[var(--text-sm)] text-[var(--text-primary)] transition placeholder:text-[var(--text-muted)] hover:border-[var(--primary)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-muted)]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-input)] px-3 py-2 text-[var(--text-sm)] text-[var(--text-primary)] transition placeholder:text-[var(--text-muted)] hover:border-[var(--primary)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-muted)]",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
