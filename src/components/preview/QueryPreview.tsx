"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { Check, Copy } from "lucide-react";
import { explainQuery } from "@/lib/explainQuery";
import { generateMongo, generatePrisma, generateRestParams, generateSQL } from "@/lib/generators";
import { useQueryBuilder } from "@/hooks/useQueryBuilder";
import { useToastStore } from "@/stores/toastStore";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Tooltip } from "@/components/ui/Tooltip";

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.default), {
  ssr: false,
  loading: () => <div className="grid h-[300px] place-items-center rounded-[var(--radius-lg)] bg-[var(--bg-input)] text-sm text-[var(--text-secondary)]">Loading editor...</div>
});

type PreviewTab = "sql" | "mongo" | "prisma" | "rest" | "explain";

const LANGUAGES: Record<PreviewTab, string> = {
  sql: "sql",
  mongo: "json",
  prisma: "javascript",
  rest: "text",
  explain: "text"
};

export function QueryPreview() {
  const { tree, schema } = useQueryBuilder();
  const [tab, setTab] = React.useState<PreviewTab>("sql");
  const [copied, setCopied] = React.useState(false);
  const pushToast = useToastStore((state) => state.pushToast);
  const previews = React.useMemo(() => ({
    sql: generateSQL(tree, schema),
    mongo: generateMongo(tree, schema),
    prisma: generatePrisma(tree, schema),
    rest: generateRestParams(tree, schema),
    explain: explainQuery(tree, schema)
  }), [schema, tree]);

  async function copyCurrent(): Promise<void> {
    await navigator.clipboard.writeText(previews[tab]);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
    pushToast({ title: "Copied preview", description: `${tab.toUpperCase()} output is on the clipboard.`, tone: "success" });
  }

  return (
    <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-3 shadow-sm" aria-label="Query preview">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Tabs value={tab} onValueChange={(value) => setTab(value as PreviewTab)}>
          <TabsList aria-label="Preview formats">
            <TabsTrigger value="sql">SQL</TabsTrigger>
            <TabsTrigger value="mongo">Mongo</TabsTrigger>
            <TabsTrigger value="prisma">Prisma</TabsTrigger>
            <TabsTrigger value="rest">REST</TabsTrigger>
            <TabsTrigger value="explain">Explain</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tooltip content="Copy current preview">
          <Button type="button" variant="secondary" size="icon" aria-label="Copy current preview" onClick={() => void copyCurrent()}>
            {copied ? <Check aria-hidden="true" className="text-[var(--success)]" size={16} /> : <Copy aria-hidden="true" size={16} />}
          </Button>
        </Tooltip>
      </div>
      <Tabs value={tab} onValueChange={(value) => setTab(value as PreviewTab)}>
        {(["sql", "mongo", "prisma", "rest", "explain"] as const).map((value) => (
          <TabsContent key={value} value={value}>
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-app)]">
              <MonacoEditor
                height="300px"
                language={LANGUAGES[value]}
                theme="querymatrix-dracula"
                beforeMount={(monaco) => {
                  monaco.editor.defineTheme("querymatrix-dracula", {
                    base: "vs-dark",
                    inherit: true,
                    rules: [
                      { token: "keyword", foreground: "ff79c6", fontStyle: "bold" },
                      { token: "identifier", foreground: "50fa7b" },
                      { token: "operator", foreground: "8be9fd" },
                      { token: "string", foreground: "f1fa8c" },
                      { token: "number", foreground: "bd93f9" },
                      { token: "delimiter", foreground: "ffb86c" },
                      { token: "comment", foreground: "6272a4" }
                    ],
                    colors: {
                      "editor.background": "#080d12",
                      "editor.foreground": "#eef6f8",
                      "editorLineNumber.foreground": "#4a6070",
                      "editorCursor.foreground": "#00c9b1",
                      "editor.lineHighlightBackground": "#1e2a3acc",
                      "editor.selectionBackground": "#00c9b126"
                    }
                  });
                }}
                value={previews[value]}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  automaticLayout: true
                }}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
