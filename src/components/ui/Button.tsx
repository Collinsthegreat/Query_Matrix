"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "icon";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded border font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] disabled:pointer-events-none disabled:opacity-50",
          variant === "primary" && "border-[var(--accent)] bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]",
          variant === "secondary" && "border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]",
          variant === "ghost" && "border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]",
          variant === "danger" && "border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.12)] text-[var(--danger)] hover:bg-[rgba(239,68,68,0.2)]",
          size === "sm" && "h-9 px-3 text-xs",
          size === "md" && "h-11 px-4 text-sm",
          size === "icon" && "h-11 w-11 p-0",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
