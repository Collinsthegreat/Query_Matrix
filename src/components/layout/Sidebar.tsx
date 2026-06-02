"use client";

import { Trash2 } from "lucide-react";
import { useHistoryStore } from "@/stores/historyStore";
import { usePresetsStore } from "@/stores/presetsStore";
import { useQueryStore } from "@/stores/queryStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function Sidebar() {
  const entries = useHistoryStore((state) => state.entries);
  const presets = usePresetsStore((state) => state.presets);
  const deletePreset = usePresetsStore((state) => state.deletePreset);
  const importTree = useQueryStore((state) => state.importTree);

  return (
    <aside className="space-y-3" aria-label="History and presets">
      <section className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Query History</h2>
          <Badge>{entries.length}</Badge>
        </div>
        <div className="max-h-44 space-y-2 overflow-auto">
          {entries.length === 0 ? <p className="text-xs text-[var(--text-secondary)]">Run a query to create history.</p> : entries.map((entry) => (
            <div key={entry.id} className="rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-input)] p-2 text-xs">
              <div className="font-semibold text-[var(--text-primary)]">{entry.summary}</div>
              <div className="mt-1 text-[var(--text-muted)]">{new Date(entry.createdAt).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Saved Presets</h2>
          <Badge>{presets.length}</Badge>
        </div>
        <div className="max-h-44 space-y-2 overflow-auto">
          {presets.length === 0 ? <p className="text-xs text-[var(--text-secondary)]">Save a query to reuse it later.</p> : presets.map((preset) => (
            <div key={preset.id} className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-input)] p-2">
              <button type="button" className="min-h-9 flex-1 rounded text-left text-xs font-semibold text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]" onClick={() => importTree(preset.tree)}>
                {preset.name}
              </button>
              <Button type="button" variant="ghost" size="icon" aria-label={`Delete preset ${preset.name}`} onClick={() => deletePreset(preset.id)}>
                <Trash2 aria-hidden="true" size={14} />
              </Button>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
