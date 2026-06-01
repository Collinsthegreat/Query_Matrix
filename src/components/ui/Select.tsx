"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-11 w-full items-center justify-between gap-2 rounded border border-[var(--border)] bg-[var(--bg-input)] px-3 text-left text-sm text-[var(--text-primary)] transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown aria-hidden="true" size={16} />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = SelectPrimitive.Value;

export function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content className={cn("z-[var(--z-dropdown)] max-h-80 overflow-auto rounded border border-[var(--border)] bg-[var(--bg-card)] p-1 text-sm text-[var(--text-primary)] shadow-md", className)}>
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ children, value }: { children: React.ReactNode; value: string }) {
  return (
    <SelectPrimitive.Item
      value={value}
      className="relative flex min-h-10 cursor-pointer select-none items-center rounded px-8 py-2 outline-none hover:bg-[var(--bg-card-hover)] focus:bg-[var(--bg-card-hover)]"
    >
      <SelectPrimitive.ItemIndicator className="absolute left-2">
        <Check aria-hidden="true" size={15} />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
