"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { useCurrentSchema } from "@/hooks/useQueryBuilder";
import { validateImportedQueryTree } from "@/lib/importValidation";
import { useQueryStore } from "@/stores/queryStore";
import { useToastStore } from "@/stores/toastStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function NaturalLanguageBar() {
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const schema = useCurrentSchema();
  const importTree = useQueryStore((state) => state.importTree);
  const pushToast = useToastStore((state) => state.pushToast);

  async function submit(): Promise<void> {
    const trimmed = input.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const response = await fetch("/api/ai-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed, schemaId: schema.id })
      });
      const payload = (await response.json()) as unknown;
      if (!response.ok || typeof payload !== "object" || payload === null || !("tree" in payload)) {
        throw new Error("AI response did not include a valid QueryTree.");
      }
      const result = validateImportedQueryTree((payload as { tree: unknown }).tree);
      if (!result.valid) throw new Error(result.error);
      importTree(result.tree);
      pushToast({ title: "Query generated! Review and run.", tone: "success" });
      setInput("");
    } catch (error) {
      const description = error instanceof Error ? error.message : "Try again with a clearer query.";
      pushToast({ title: "Could not generate query", description, tone: "error", actionLabel: "Retry", action: () => void submit() });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-2 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded border border-[var(--border)] bg-[var(--accent-muted)] text-lg">✨</span>
      <label className="sr-only" htmlFor="natural-language-query">Describe your query</label>
      <Input
        id="natural-language-query"
        value={input}
        placeholder="Describe your query in plain English..."
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setInput("");
          }
        }}
        disabled={loading}
      />
      <Button type="submit" variant="primary" className="min-w-32" disabled={loading || !input.trim()}>
        {loading ? <Loader2 aria-label="Generating query" className="animate-spin" size={17} /> : "Generate →"}
      </Button>
    </form>
  );
}
