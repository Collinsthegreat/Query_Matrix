"use client";

import { Command, Play, Sparkles } from "lucide-react";
import { ComplexityBadge } from "@/components/shared/ComplexityBadge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Toolbar } from "@/components/shared/Toolbar";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { SchemaSwitcher } from "@/components/schema/SchemaSwitcher";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import type { ComplexityResult } from "@/lib/complexity";

type HeaderProps = {
  complexity: ComplexityResult;
  onOpenPalette: () => void;
  onRun: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
  onCopySql: () => void;
  onSavePreset: () => void;
  onLoadDemo: () => void;
  onCopyShareUrl: () => void;
};

export function Header({ complexity, onOpenPalette, onRun, onExportJson, onImportJson, onCopySql, onSavePreset, onLoadDemo, onCopyShareUrl }: HeaderProps) {
  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-[var(--border)] bg-[var(--bg-glass)] backdrop-blur">
      <div className="flex min-h-16 flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex min-w-64 flex-[1_1_300px] items-center gap-3">
          <a href="#query-builder" className="skip-link">Skip to builder</a>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[var(--border-accent)] bg-[var(--accent-muted)] font-mono font-bold text-[var(--text-accent)]">QF</div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-[var(--text-primary)]">QueryForge</h1>
            <p className="hidden max-w-[34ch] truncate text-xs text-[var(--text-secondary)] sm:block">Visual Query Engineering Platform</p>
          </div>
        </div>
        <div className="hidden min-w-0 flex-[1_1_430px] flex-wrap items-center justify-start gap-2 lg:flex xl:justify-center">
          <SchemaSwitcher />
          <ViewToggle />
          <ComplexityBadge complexity={complexity} />
        </div>
        <div className="flex min-w-0 flex-[1_1_560px] flex-wrap items-center justify-start gap-2 sm:justify-end">
          <div className="hidden 2xl:block">
            <Toolbar onRun={onRun} onExportJson={onExportJson} onImportJson={onImportJson} onCopySql={onCopySql} onSavePreset={onSavePreset} onLoadDemo={onLoadDemo} onCopyShareUrl={onCopyShareUrl} />
          </div>
          <Tooltip content="Run query (⌘Enter)">
            <Button type="button" variant="primary" size="sm" className="2xl:hidden" onClick={onRun}>
              <Play aria-hidden="true" size={15} />
              Run
            </Button>
          </Tooltip>
          <Tooltip content="Load benchmark demo">
            <Button type="button" variant="secondary" size="sm" className="2xl:hidden" onClick={onLoadDemo}>
              <Sparkles aria-hidden="true" size={15} />
              <span className="hidden sm:inline">Demo</span>
            </Button>
          </Tooltip>
          <ThemeToggle />
          <Tooltip content="Open command palette (⌘K)">
            <Button type="button" variant="secondary" size="sm" onClick={onOpenPalette}>
              <Command aria-hidden="true" size={15} />
              <span className="font-mono">⌘K</span>
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto border-t border-[var(--border)] px-4 py-2 lg:hidden">
        <SchemaSwitcher />
        <ComplexityBadge complexity={complexity} />
      </div>
    </header>
  );
}
