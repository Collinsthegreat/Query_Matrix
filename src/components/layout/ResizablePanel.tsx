"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function ResizablePanel({ left, right, className }: { left: React.ReactNode; right: React.ReactNode; className?: string }) {
  const [leftWidth, setLeftWidth] = React.useState(60);
  const dragging = React.useRef(false);

  React.useEffect(() => {
    function onMove(event: PointerEvent): void {
      if (!dragging.current) return;
      const width = window.innerWidth;
      const next = Math.min(70, Math.max(45, (event.clientX / width) * 100));
      setLeftWidth(next);
    }
    function onUp(): void {
      dragging.current = false;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const panelStyle = { "--left-panel": `${leftWidth}%` } as React.CSSProperties & Record<"--left-panel", string>;

  return (
    <div
      style={panelStyle}
      className={cn("desktop-panels min-h-0 flex-1 gap-3 lg:grid lg:grid-cols-[var(--left-panel)_8px_minmax(320px,1fr)]", className)}
    >
      <div className="min-h-0 overflow-hidden">{left}</div>
      <button
        type="button"
        className="hidden cursor-col-resize rounded-full bg-[var(--border-default)] hover:bg-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] lg:block"
        aria-label="Resize panels"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          dragging.current = true;
        }}
      />
      <div className="min-h-0 overflow-auto">{right}</div>
    </div>
  );
}
