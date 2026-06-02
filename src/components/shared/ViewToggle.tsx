"use client";

import { GitBranch, ListTree } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { useSettingsStore } from "@/stores/settingsStore";
import { cn } from "@/lib/utils";

export function ViewToggle() {
  const viewMode = useSettingsStore((state) => state.viewMode);
  const setViewMode = useSettingsStore((state) => state.setViewMode);
  return (
    <div className="hidden items-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-input)] p-1 md:flex" role="tablist" aria-label="Builder view">
      <Tooltip content="Switch to Form view (⌘1)">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          role="tab"
          aria-selected={viewMode === "form"}
          className={cn("h-8 border-transparent px-2", viewMode === "form" && "bg-[var(--primary-muted)] text-[var(--primary)]")}
          onClick={() => setViewMode("form")}
        >
          <ListTree aria-hidden="true" size={15} />
          Form
        </Button>
      </Tooltip>
      <Tooltip content="Switch to Graph view (⌘2)">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          role="tab"
          aria-selected={viewMode === "graph"}
          className={cn("h-8 border-transparent px-2", viewMode === "graph" && "bg-[var(--primary-muted)] text-[var(--primary)]")}
          onClick={() => setViewMode("graph")}
        >
          <GitBranch aria-hidden="true" size={15} />
          Graph
        </Button>
      </Tooltip>
    </div>
  );
}
