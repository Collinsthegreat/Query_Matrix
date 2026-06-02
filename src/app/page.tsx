"use client";

import * as React from "react";
import { MotionConfig } from "framer-motion";
import { getSchemaById } from "@/lib/constants";
import { createBenchmarkDemoTree } from "@/lib/demoScenarios";
import { generateSQL } from "@/lib/generators";
import { validateImportedQueryTree } from "@/lib/importValidation";
import { buildShareUrl, decodeShareUrl } from "@/lib/shareUrl";
import { formatRelativeRun } from "@/lib/utils";
import { treeUtils } from "@/lib/treeUtils";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useQueryBuilder } from "@/hooks/useQueryBuilder";
import { useRunQuery } from "@/hooks/useRunQuery";
import { useHistoryStore } from "@/stores/historyStore";
import { usePresetsStore } from "@/stores/presetsStore";
import { useQueryStore } from "@/stores/queryStore";
import { queryTemporalStore } from "@/stores/queryTemporal";
import { useSettingsStore, type MobileTab } from "@/stores/settingsStore";
import { useToastStore } from "@/stores/toastStore";
import { Button } from "@/components/ui/Button";
import { ToastViewport } from "@/components/ui/ToastViewport";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { QueryBuilder } from "@/components/builder/QueryBuilder";
import { QueryPreview } from "@/components/preview/QueryPreview";
import { QuerySimulator } from "@/components/simulator/QuerySimulator";
import { CommandPalette } from "@/components/palette/CommandPalette";
import { HistoryTimeline } from "@/components/timeline/HistoryTimeline";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ResizablePanel } from "@/components/layout/ResizablePanel";
import { RunPulseFrame } from "@/components/shared/RunPulseFrame";
import { cn } from "@/lib/utils";

const MOBILE_TABS: MobileTab[] = ["Build", "Preview", "Results", "History"];
const MOBILE_TAB_ICONS: Record<MobileTab, string> = {
  Build: "ti-layout-list",
  Preview: "ti-code",
  Results: "ti-table",
  History: "ti-history"
};

export default function HomePage() {
  const { tree, schema, complexity, counts, depth } = useQueryBuilder();
  const importTree = useQueryStore((state) => state.importTree);
  const addRule = useQueryStore((state) => state.addRule);
  const addGroup = useQueryStore((state) => state.addGroup);
  const theme = useSettingsStore((state) => state.theme);
  const toggleTheme = useSettingsStore((state) => state.toggleTheme);
  const viewMode = useSettingsStore((state) => state.viewMode);
  const setViewMode = useSettingsStore((state) => state.setViewMode);
  const mobileTab = useSettingsStore((state) => state.mobileTab);
  const setMobileTab = useSettingsStore((state) => state.setMobileTab);
  const savePreset = usePresetsStore((state) => state.savePreset);
  const lastRunAt = useHistoryStore((state) => state.lastRunAt);
  const lastResult = useHistoryStore((state) => state.lastResult);
  const pushToast = useToastStore((state) => state.pushToast);
  const runQuery = useRunQuery();
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  React.useEffect(() => {
    const result = decodeShareUrl(window.location.href);
    if (!result.valid) return;
    importTree(result.tree);
    setViewMode(result.viewMode);
    pushToast({ title: "Shared query loaded", tone: "success" });
  }, [importTree, pushToast, setViewMode]);

  const run = React.useCallback(async (): Promise<void> => {
    await runQuery();
  }, [runQuery]);

  const exportJson = React.useCallback((): void => {
    const blob = new Blob([JSON.stringify(tree, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `querymatrix-${schema.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    pushToast({ title: "Query JSON exported", tone: "success" });
  }, [pushToast, schema.id, tree]);

  const importJson = React.useCallback((): void => {
    fileInputRef.current?.click();
  }, []);

  const copySql = React.useCallback(async (): Promise<void> => {
    await navigator.clipboard.writeText(generateSQL(tree, schema));
    pushToast({ title: "SQL copied", description: "The SQL preview is on your clipboard.", tone: "success" });
  }, [pushToast, schema, tree]);

  const saveCurrentPreset = React.useCallback((): void => {
    savePreset(`${schema.name} preset ${new Date().toLocaleTimeString()}`, tree);
    pushToast({ title: "Preset saved", tone: "success" });
  }, [pushToast, savePreset, schema.name, tree]);

  const copyShareUrl = React.useCallback(async (): Promise<void> => {
    const url = buildShareUrl(`${window.location.origin}${window.location.pathname}`, tree, viewMode);
    await navigator.clipboard.writeText(url);
    pushToast({ title: "Share URL copied", description: "The current query can now be opened from the clipboard link.", tone: "success" });
  }, [pushToast, tree, viewMode]);

  const loadBenchmarkDemo = React.useCallback(async (): Promise<void> => {
    const demoTree = createBenchmarkDemoTree();
    const demoSchema = getSchemaById(demoTree.schemaId);
    importTree(demoTree);
    setViewMode("graph");
    setMobileTab("Build");
    savePreset("Benchmark demo", demoTree);
    pushToast({ title: "Benchmark demo loaded", description: "Graph, preview, results, impact lens, and history are staged.", tone: "success" });
    await runQuery({ tree: demoTree, schema: demoSchema });
  }, [importTree, pushToast, runQuery, savePreset, setMobileTab, setViewMode]);

  const shortcutHandlers = React.useMemo(() => ({
    openPalette: () => setPaletteOpen(true),
    undo: () => queryTemporalStore.getState().undo(),
    redo: () => queryTemporalStore.getState().redo(),
    runQuery: () => void run(),
    exportJson,
    importJson,
    copySql: () => void copySql(),
    toggleTheme,
    formView: () => setViewMode("form"),
    graphView: () => setViewMode("graph"),
    addRule: () => addRule(tree.root.id),
    addGroup: () => addGroup(tree.root.id),
    escape: () => setPaletteOpen(false)
  }), [addGroup, addRule, copySql, exportJson, importJson, run, setViewMode, toggleTheme, tree.root.id]);
  useKeyboardShortcuts(shortcutHandlers);

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const parsed = JSON.parse(text) as unknown;
      const result = validateImportedQueryTree(parsed);
      if (!result.valid) throw new Error(result.error);
      importTree(result.tree);
      pushToast({ title: "Query imported", tone: "success" });
    } catch (error) {
      const description = error instanceof Error ? error.message : "The selected file is not a valid QueryMatrix JSON export.";
      pushToast({ title: "Import failed", description, tone: "error" });
    } finally {
      event.target.value = "";
    }
  }

  const resultImpact = lastResult ? `${lastResult.results.length} / ${lastResult.scannedRows} rows match` : null;
  const rightPanel = (
    <div className="grid min-h-0 gap-3">
      <RunPulseFrame pulseKey={lastRunAt} order={1}><QueryPreview /></RunPulseFrame>
      <RunPulseFrame pulseKey={lastRunAt} order={2}><QuerySimulator /></RunPulseFrame>
      <Sidebar />
    </div>
  );

  return (
    <TooltipProvider>
      <MotionConfig reducedMotion="user">
        <main className="flex min-h-screen flex-col bg-[var(--bg-app)] text-[var(--text-primary)]">
          <Header
            complexity={complexity}
            onOpenPalette={() => setPaletteOpen(true)}
            onRun={() => void run()}
            onExportJson={exportJson}
            onImportJson={importJson}
            onCopySql={() => void copySql()}
            onSavePreset={saveCurrentPreset}
            onLoadDemo={() => void loadBenchmarkDemo()}
            onCopyShareUrl={() => void copyShareUrl()}
          />
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={(event) => void handleImport(event)} />

          <div className="hidden min-h-0 flex-1 gap-3 p-3 md:flex md:flex-col lg:block">
            <ResizablePanel
              left={<div className="flex h-full min-h-0 flex-col gap-3"><RunPulseFrame pulseKey={lastRunAt} order={0}><QueryBuilder /></RunPulseFrame><RunPulseFrame pulseKey={lastRunAt} order={3}><HistoryTimeline /></RunPulseFrame></div>}
              right={rightPanel}
            />
          </div>

          <div className="flex flex-1 flex-col md:hidden">
            <nav className="mobile-tab-bar" aria-label="Mobile workspace tabs">
              {MOBILE_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={mobileTab === tab}
                  className={cn("mobile-tab focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]", mobileTab === tab && "active")}
                  onClick={() => setMobileTab(tab)}
                >
                  <i className={`ti ${MOBILE_TAB_ICONS[tab]}`} aria-hidden="true" />
                  {tab}
                </button>
              ))}
            </nav>
            <div className="min-h-0 flex-1 overflow-auto p-3">
              {mobileTab === "Build" && <RunPulseFrame pulseKey={lastRunAt} order={0}><QueryBuilder /></RunPulseFrame>}
              {mobileTab === "Preview" && <RunPulseFrame pulseKey={lastRunAt} order={1}><QueryPreview /></RunPulseFrame>}
              {mobileTab === "Results" && <RunPulseFrame pulseKey={lastRunAt} order={2}><QuerySimulator /></RunPulseFrame>}
              {mobileTab === "History" && <div className="grid gap-3"><HistoryTimeline /><Sidebar /></div>}
            </div>
            <Button type="button" variant="primary" className="mobile-run-btn" onClick={() => void run()}>
              <i className="ti ti-player-play" aria-hidden="true" />
              Run Query
            </Button>
          </div>

          <footer className="flex h-[30px] shrink-0 items-center border-t border-[var(--border-default)] bg-[var(--bg-panel)] px-4 font-mono text-[var(--text-xs)] text-[var(--text-muted)]">
            <div className="flex h-full items-center gap-1 border-r border-[var(--border-subtle)] px-3">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-[var(--success)]" aria-hidden="true" />
              Live
            </div>
            <div className="flex h-full items-center gap-1 border-r border-[var(--border-subtle)] px-3">
              <i className="ti ti-list" aria-hidden="true" />
              <span className="status-bar-value text-[var(--text-secondary)]">{counts.rules}</span> rules
            </div>
            <div className="flex h-full items-center gap-1 border-r border-[var(--border-subtle)] px-3">
              <i className="ti ti-layout-rows" aria-hidden="true" />
              <span className="status-bar-value text-[var(--text-secondary)]">{counts.groups}</span> groups
            </div>
            <div className="flex h-full items-center gap-1 border-r border-[var(--border-subtle)] px-3">
              <i className="ti ti-git-branch" aria-hidden="true" />
              Depth <span className="status-bar-value text-[var(--text-secondary)]">{depth}</span>
            </div>
            <div className="flex-1" />
            {resultImpact && (
              <div className="hidden h-full items-center gap-1 border-l border-[var(--border-subtle)] px-3 text-[var(--primary)] sm:flex">
                <i className="ti ti-target" aria-hidden="true" />
                <span className="status-bar-value">{resultImpact}</span>
              </div>
            )}
            <div className="flex h-full items-center gap-1 border-l border-[var(--border-subtle)] px-3">
              <i className="ti ti-clock" aria-hidden="true" />
              Last run: <span className={cn("status-bar-value", lastRunAt ? "text-[var(--text-secondary)]" : "text-[var(--text-disabled)]")}>{formatRelativeRun(lastRunAt)}</span>
            </div>
          </footer>
          <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} onRun={() => void run()} onExportJson={exportJson} onImportJson={importJson} onCopySql={() => void copySql()} onLoadDemo={() => void loadBenchmarkDemo()} onCopyShareUrl={() => void copyShareUrl()} />
          <ToastViewport />
        </main>
      </MotionConfig>
    </TooltipProvider>
  );
}
