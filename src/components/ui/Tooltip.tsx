"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;

export function Tooltip({ children, content }: { children: React.ReactNode; content: React.ReactNode }) {
  return (
    <TooltipPrimitive.Root delayDuration={180}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={8}
          className={cn("z-[var(--z-dropdown)] max-w-72 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-tooltip)] px-3 py-2 text-[var(--text-xs)] text-[var(--text-primary)] shadow-md")}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-[var(--bg-tooltip)]" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
