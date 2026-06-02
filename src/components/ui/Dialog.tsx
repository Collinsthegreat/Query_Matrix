"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ children, className, title }: { children: React.ReactNode; className?: string; title: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-[var(--bg-overlay)] backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-[15%] z-[var(--z-modal)] max-h-[88vh] w-[min(92vw,720px)] -translate-x-1/2 overflow-auto rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--bg-panel)] p-5 text-[var(--text-primary)] shadow-md focus:outline-none",
          className
        )}
        aria-describedby={undefined}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <DialogPrimitive.Title className="text-[var(--text-md)] font-semibold">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Close aria-label="Close dialog" className="rounded-[var(--radius-sm)] p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]">
            <X aria-hidden="true" size={18} />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
