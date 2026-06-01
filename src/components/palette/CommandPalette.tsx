"use client";

import * as React from "react";
import { Command } from "cmdk";
import type { LucideIcon } from "lucide-react";
import { BarChart, Copy, Download, GitBranch, Layers, Link2, List, Moon, Package, Play, Plus, Redo2, Sparkles, Star, Store, Trash2, Undo2, Upload, User } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { useQueryStore } from "@/stores/queryStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { usePresetsStore } from "@/stores/presetsStore";
import { queryTemporalStore } from "@/stores/queryTemporal";

type CommandItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
  description: string;
  preview: string;
  group: "Builder Actions" | "View" | "Query" | "Schemas" | "Presets";
  action: () => void;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRun: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
  onCopySql: () => void;
  onLoadDemo: () => void;
  onCopyShareUrl: () => void;
};

export function CommandPalette({ open, onOpenChange, onRun, onExportJson, onImportJson, onCopySql, onLoadDemo, onCopyShareUrl }: Props) {
  const [recent, setRecent] = React.useState<string[]>([]);
  const [activeId, setActiveId] = React.useState<string>("run-query");
  const tree = useQueryStore((state) => state.tree);
  const addRule = useQueryStore((state) => state.addRule);
  const addGroup = useQueryStore((state) => state.addGroup);
  const clearAll = useQueryStore((state) => state.clearAll);
  const setSchema = useQueryStore((state) => state.setSchema);
  const setViewMode = useSettingsStore((state) => state.setViewMode);
  const toggleTheme = useSettingsStore((state) => state.toggleTheme);
  const savePreset = usePresetsStore((state) => state.savePreset);

  const commands = React.useMemo<CommandItem[]>(() => [
    { id: "add-rule", label: "Add Rule", icon: Plus, shortcut: "A", description: "Append a schema-aware rule to the root group.", preview: "Creates a new editable rule row.", group: "Builder Actions", action: () => addRule(tree.root.id) },
    { id: "add-group", label: "Add Group", icon: Layers, shortcut: "G", description: "Append a nested condition group to the root.", preview: "Creates a collapsible AND group ready for rules.", group: "Builder Actions", action: () => addGroup(tree.root.id) },
    { id: "clear-all", label: "Clear All Rules", icon: Trash2, description: "Reset the current schema to an empty query.", preview: "Removes all rules and groups from the builder.", group: "Builder Actions", action: clearAll },
    { id: "undo", label: "Undo", icon: Undo2, shortcut: "⌘Z", description: "Move one snapshot back in query history.", preview: "Restores the previous tree state.", group: "Builder Actions", action: () => queryTemporalStore.getState().undo() },
    { id: "redo", label: "Redo", icon: Redo2, shortcut: "⌘⇧Z", description: "Move one snapshot forward in query history.", preview: "Reapplies the next tree state.", group: "Builder Actions", action: () => queryTemporalStore.getState().redo() },
    { id: "form-view", label: "Switch to Form View", icon: List, description: "Return to the recursive builder surface.", preview: "Shows nested groups and rule rows.", group: "View", action: () => setViewMode("form") },
    { id: "graph-view", label: "Switch to Graph View", icon: GitBranch, description: "Open the ReactFlow graph projection.", preview: "Shows dagre layout, AND/OR edges, and run glow.", group: "View", action: () => setViewMode("graph") },
    { id: "toggle-theme", label: "Toggle Dark/Light Mode", icon: Moon, shortcut: "⌘/", description: "Switch the CSS-token theme.", preview: "Preserves the query while flipping visual mode.", group: "View", action: toggleTheme },
    { id: "run-query", label: "Run Query", icon: Play, shortcut: "⌘↵", description: "Validate and execute against the mock dataset.", preview: "Updates results, graph glow, run history, and status bar.", group: "Query", action: onRun },
    { id: "load-demo", label: "Load Benchmark Demo", icon: Sparkles, description: "Stage a complete presentation-ready query.", preview: "Imports a nested tree, switches to graph view, saves a preset, and runs automatically.", group: "Query", action: onLoadDemo },
    { id: "copy-share-url", label: "Copy Share URL", icon: Link2, description: "Create a compressed URL for the current query.", preview: "Copies a backend-free link that restores this query.", group: "Query", action: onCopyShareUrl },
    { id: "export-json", label: "Export Query as JSON", icon: Download, shortcut: "⌘E", description: "Download the validated query tree.", preview: "Creates a QueryForge JSON export.", group: "Query", action: onExportJson },
    { id: "export-sql", label: "Copy SQL to Clipboard", icon: Copy, shortcut: "⌘⇧C", description: "Copy the SQL projection.", preview: "Places the current SQL preview on the clipboard.", group: "Query", action: onCopySql },
    { id: "import-json", label: "Import Query JSON", icon: Upload, shortcut: "⌘I", description: "Open a QueryForge JSON export.", preview: "Validates recursive structure before importing.", group: "Query", action: onImportJson },
    { id: "schema-users", label: "Switch Schema: Users", icon: User, description: "Load the users schema.", preview: "Resets the builder to user account fields.", group: "Schemas", action: () => setSchema("users") },
    { id: "schema-orders", label: "Switch Schema: Orders", icon: Package, description: "Load the orders schema.", preview: "Resets the builder to transaction fields.", group: "Schemas", action: () => setSchema("orders") },
    { id: "schema-products", label: "Switch Schema: Products", icon: Store, description: "Load the products schema.", preview: "Resets the builder to catalog fields.", group: "Schemas", action: () => setSchema("products") },
    { id: "schema-analytics", label: "Switch Schema: Analytics", icon: BarChart, description: "Load the analytics schema.", preview: "Resets the builder to event-tracking fields.", group: "Schemas", action: () => setSchema("analytics") },
    { id: "save-preset", label: "Save as Preset", icon: Star, description: "Persist the current query locally.", preview: "Adds this tree to saved presets.", group: "Presets", action: () => savePreset(`Preset ${new Date().toLocaleTimeString()}`, tree) }
  ], [addGroup, addRule, clearAll, onCopyShareUrl, onCopySql, onExportJson, onImportJson, onLoadDemo, onRun, savePreset, setSchema, setViewMode, toggleTheme, tree]);

  const ordered = React.useMemo(() => [...commands].sort((a, b) => recent.indexOf(b.id) - recent.indexOf(a.id)), [commands, recent]);
  const activeCommand = commands.find((command) => command.id === activeId) ?? ordered[0];
  const groups = ["Builder Actions", "View", "Query", "Schemas", "Presets"] as const;

  function execute(command: CommandItem): void {
    command.action();
    setRecent((current) => [command.id, ...current.filter((id) => id !== command.id)].slice(0, 6));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Command Palette" className="w-[min(90vw,680px)] p-0">
        <Command className="overflow-hidden rounded-lg bg-[var(--bg-card)]" loop>
          <Command.Input className="h-12 w-full border-b border-[var(--border)] bg-[var(--bg-input)] px-4 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" placeholder="Search commands..." />
          <div className="grid md:grid-cols-[minmax(0,1fr)_270px]">
            <Command.List className="max-h-96 overflow-auto p-2">
              <Command.Empty className="p-6 text-center text-sm text-[var(--text-secondary)]">No matching command.</Command.Empty>
              {groups.map((group) => (
                <Command.Group key={group} heading={<span className="px-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{group}</span>}>
                  {ordered.filter((command) => command.group === group).map((command) => {
                    const Icon = command.icon;
                    return (
                      <Command.Item
                        key={command.id}
                        value={`${command.group} ${command.label}`}
                        onMouseEnter={() => setActiveId(command.id)}
                        onFocus={() => setActiveId(command.id)}
                        onSelect={() => execute(command)}
                        className="flex min-h-11 cursor-pointer items-center gap-3 rounded px-3 text-sm text-[var(--text-primary)] outline-none aria-selected:bg-[var(--bg-card-hover)]"
                      >
                        <Icon aria-hidden="true" size={16} />
                        <span className="flex-1">{command.label}</span>
                        {recent.includes(command.id) && <Badge tone="accent">Recent</Badge>}
                        {command.shortcut && <Badge>{command.shortcut}</Badge>}
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              ))}
            </Command.List>
            {activeCommand && (
              <aside className="hidden border-l border-[var(--border)] bg-[var(--bg-input)] p-4 md:block" aria-label="Command preview">
                <div className="text-xs font-semibold uppercase text-[var(--text-muted)]">Preview</div>
                <div className="mt-3 text-sm font-semibold text-[var(--text-primary)]">{activeCommand.label}</div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{activeCommand.description}</p>
                <div className="mt-4 rounded border border-[var(--border)] bg-[var(--bg-card)] p-3 text-xs text-[var(--text-secondary)]">{activeCommand.preview}</div>
                {activeCommand.shortcut && <div className="mt-3"><Badge>{activeCommand.shortcut}</Badge></div>}
              </aside>
            )}
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
