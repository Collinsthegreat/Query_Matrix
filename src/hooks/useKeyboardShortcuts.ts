"use client";

import { useEffect } from "react";

type ShortcutHandlers = {
  openPalette: () => void;
  undo: () => void;
  redo: () => void;
  runQuery: () => void;
  exportJson: () => void;
  importJson: () => void;
  copySql: () => void;
  toggleTheme: () => void;
  formView: () => void;
  graphView: () => void;
  addRule: () => void;
  addGroup: () => void;
  escape: () => void;
};

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      if (mod && key === "k") { event.preventDefault(); handlers.openPalette(); return; }
      if (mod && key === "z" && !event.shiftKey) { event.preventDefault(); handlers.undo(); return; }
      if (mod && key === "z" && event.shiftKey) { event.preventDefault(); handlers.redo(); return; }
      if (mod && key === "enter") { event.preventDefault(); handlers.runQuery(); return; }
      if (mod && key === "e") { event.preventDefault(); handlers.exportJson(); return; }
      if (mod && key === "i") { event.preventDefault(); handlers.importJson(); return; }
      if (mod && key === "c" && event.shiftKey) { event.preventDefault(); handlers.copySql(); return; }
      if (mod && key === "/") { event.preventDefault(); handlers.toggleTheme(); return; }
      if (mod && key === "1") { event.preventDefault(); handlers.formView(); return; }
      if (mod && key === "2") { event.preventDefault(); handlers.graphView(); return; }
      if (key === "escape") { handlers.escape(); return; }
      if (!isEditable(event.target) && key === "a") { event.preventDefault(); handlers.addRule(); return; }
      if (!isEditable(event.target) && key === "g") { event.preventDefault(); handlers.addGroup(); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
}
