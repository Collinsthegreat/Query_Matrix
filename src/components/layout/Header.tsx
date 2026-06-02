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
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-[var(--border-default)] bg-[var(--bg-panel)]">
      <div className="flex min-h-[52px] flex-wrap items-center gap-3 px-5 py-2">
        <div className="flex min-w-64 flex-[1_1_300px] items-center gap-3">
          <a href="#query-builder" className="skip-link">Skip to builder</a>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[var(--primary-border)] bg-[var(--primary-muted)] font-mono text-[var(--text-sm)] font-bold text-[var(--primary)] shadow-[var(--shadow-glow)]">QM</div>
          <div className="min-w-0">
            <h1 className="truncate font-[var(--font-ui)] text-[15px] font-semibold leading-tight tracking-[-0.025em]">
              <span className="text-[var(--primary)]">Query</span>
              <span className="text-[var(--text-primary)]">Matrix</span>
            </h1>
            <p className="hidden max-w-[34ch] truncate text-xs text-[var(--text-secondary)] sm:block">Visual Query Engineering Platform</p>
          </div>
          <div className="hidden h-5 w-px bg-[var(--border-default)] md:block" aria-hidden="true" />
          <div className="hidden items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--success-border)] bg-[var(--success-muted)] px-2.5 py-1 text-[var(--text-xs)] text-[var(--text-muted)] md:flex">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-[var(--success)]" aria-hidden="true" />
            Live
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
            <Button type="button" variant="secondary" size="sm" className="font-mono text-[var(--text-muted)]" onClick={onOpenPalette}>
              <Command aria-hidden="true" size={15} />
              <span>⌘ · K</span>
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto border-t border-[var(--border-default)] px-4 py-2 lg:hidden">
        <SchemaSwitcher />
        <ComplexityBadge complexity={complexity} />
      </div>
    </header>
  );
}
