"use client";

import { Download, FileJson, FolderOpen, Link2, Play, Save, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";

type ToolbarProps = {
  onRun: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
  onCopySql: () => void;
  onSavePreset: () => void;
  onLoadDemo: () => void;
  onCopyShareUrl: () => void;
};

export function Toolbar({ onRun, onExportJson, onImportJson, onCopySql, onSavePreset, onLoadDemo, onCopyShareUrl }: ToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <Tooltip content="Run query (⌘Enter)">
        <Button type="button" variant="primary" size="sm" onClick={onRun}>
          <Play aria-hidden="true" size={15} />
          Run
        </Button>
      </Tooltip>
      <Tooltip content="Load benchmark demo">
        <Button type="button" variant="secondary" size="sm" onClick={onLoadDemo}>
          <Sparkles aria-hidden="true" size={15} />
          Demo
        </Button>
      </Tooltip>
      <Tooltip content="Copy shareable query URL">
        <Button type="button" variant="secondary" size="icon" aria-label="Copy shareable query URL" onClick={onCopyShareUrl}>
          <Link2 aria-hidden="true" size={16} />
        </Button>
      </Tooltip>
      <Tooltip content="Export query JSON (⌘E)">
        <Button type="button" variant="secondary" size="icon" aria-label="Export query JSON" onClick={onExportJson}>
          <Download aria-hidden="true" size={16} />
        </Button>
      </Tooltip>
      <Tooltip content="Import query JSON (⌘I)">
        <Button type="button" variant="secondary" size="icon" aria-label="Import query JSON" onClick={onImportJson}>
          <Upload aria-hidden="true" size={16} />
        </Button>
      </Tooltip>
      <Tooltip content="Copy SQL to clipboard (⌘⇧C)">
        <Button type="button" variant="secondary" size="icon" aria-label="Copy SQL to clipboard" onClick={onCopySql}>
          <FileJson aria-hidden="true" size={16} />
        </Button>
      </Tooltip>
      <Tooltip content="Save current query as preset">
        <Button type="button" variant="secondary" size="icon" aria-label="Save preset" onClick={onSavePreset}>
          <Save aria-hidden="true" size={16} />
        </Button>
      </Tooltip>
      <Tooltip content="Open saved presets">
        <span className="hidden lg:inline-flex">
          <Button type="button" variant="secondary" size="icon" aria-label="Open saved presets">
            <FolderOpen aria-hidden="true" size={16} />
          </Button>
        </span>
      </Tooltip>
    </div>
  );
}
