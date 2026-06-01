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
    link.download = `queryforge-${schema.id}.json`;
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
      const description = error instanceof Error ? error.message : "The selected file is not a valid QueryForge JSON export.";
      pushToast({ title: "Import failed", description, tone: "error" });
    } finally {
      event.target.value = "";
    }
  }

  const statusText = `${counts.rules} rules · ${counts.groups} groups · Depth ${depth} · Last run: ${formatRelativeRun(lastRunAt)}`;
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
        <main className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
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
            <nav className="grid grid-cols-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]" aria-label="Mobile workspace tabs">
              {MOBILE_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={mobileTab === tab}
                  className={cn("min-h-12 text-sm font-semibold text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]", mobileTab === tab && "bg-[var(--accent-muted)] text-[var(--text-primary)]")}
                  onClick={() => setMobileTab(tab)}
                >
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
            <div className="fixed bottom-0 left-0 right-0 z-[var(--z-sticky)] border-t border-[var(--border)] bg-[var(--bg-glass)] p-2 backdrop-blur">
              <Button type="button" variant="primary" className="h-14 w-full text-base" onClick={() => void run()}>
                ▶ Run Query
              </Button>
            </div>
          </div>

          <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2 text-xs text-[var(--text-secondary)]">
            {statusText}
          </footer>
          <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} onRun={() => void run()} onExportJson={exportJson} onImportJson={importJson} onCopySql={() => void copySql()} onLoadDemo={() => void loadBenchmarkDemo()} onCopyShareUrl={() => void copyShareUrl()} />
          <ToastViewport />
        </main>
      </MotionConfig>
    </TooltipProvider>
  );
}
