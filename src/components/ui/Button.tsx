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
          "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border font-[var(--weight-medium)] transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)] disabled:pointer-events-none disabled:opacity-35",
          variant === "primary" && "border-transparent bg-[var(--primary)] text-[var(--text-on-primary)] shadow-[var(--shadow-glow)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] active:scale-[0.98]",
          variant === "secondary" && "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] active:scale-[0.98]",
          variant === "ghost" && "border-transparent bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]",
          variant === "danger" && "border-[var(--danger-border)] bg-[var(--danger-muted)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white active:scale-[0.98]",
          size === "sm" && "h-8 px-3 text-[var(--text-xs)]",
          size === "md" && "h-10 px-4 text-[var(--text-sm)]",
          size === "icon" && "h-8 w-8 p-0",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
