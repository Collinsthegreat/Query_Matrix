"use client";

import { useEffect } from "react";
import { useToastStore } from "@/stores/toastStore";
import { cn } from "@/lib/utils";

export function ToastViewport() {
  const messages = useToastStore((state) => state.messages);
  const removeToast = useToastStore((state) => state.removeToast);

  useEffect(() => {
    if (messages.length === 0) return;
    const timers = messages.map((message) => window.setTimeout(() => removeToast(message.id), 4200));
    return () => timers.forEach(window.clearTimeout);
  }, [messages, removeToast]);

  return (
    <div className="fixed bottom-4 right-4 z-[var(--z-toast)] grid w-[min(92vw,360px)] gap-2" role="status" aria-live="polite">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "rounded-lg border bg-[var(--bg-card)] p-3 text-sm shadow-md",
            message.tone === "success" && "border-[rgba(34,197,94,0.35)]",
            message.tone === "error" && "border-[rgba(239,68,68,0.35)]",
            message.tone === "info" && "border-[var(--border-accent)]"
          )}
        >
          <div className="font-semibold text-[var(--text-primary)]">{message.title}</div>
          {message.description && <div className="mt-1 text-[var(--text-secondary)]">{message.description}</div>}
          {message.action && message.actionLabel && (
            <button
              type="button"
              className="mt-2 rounded border border-[var(--border)] px-2 py-1 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              onClick={message.action}
            >
              {message.actionLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
