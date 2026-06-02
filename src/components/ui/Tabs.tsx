"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn("inline-flex rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-card)] p-1", className)} {...props} />;
}

export function TabsTrigger({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn("min-h-8 rounded-[var(--radius-sm)] px-3 text-[var(--text-xs)] font-medium text-[var(--text-muted)] transition data-[state=active]:bg-[var(--primary-muted)] data-[state=active]:text-[var(--primary)] hover:text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]", className)}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("focus-visible:outline-none", className)} {...props} />;
}
