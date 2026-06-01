"use client";

import { motion } from "framer-motion";
import { SCHEMAS } from "@/lib/constants";
import { useQueryStore } from "@/stores/queryStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

export function SchemaSwitcher() {
  const schemaId = useQueryStore((state) => state.tree.schemaId);
  const setSchema = useQueryStore((state) => state.setSchema);
  const current = SCHEMAS.find((schema) => schema.id === schemaId) ?? SCHEMAS[0]!;

  return (
    <motion.div
      key={schemaId}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.18 }}
      className="min-w-48"
    >
      <label className="sr-only" htmlFor="schema-switcher">Schema</label>
      <Select value={schemaId} onValueChange={setSchema}>
        <SelectTrigger id="schema-switcher" aria-label="Switch schema">
          <SelectValue>
            <span className="flex items-center gap-2">
              <span aria-hidden="true">{current.icon}</span>
              <span>{current.name}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SCHEMAS.map((schema) => (
            <SelectItem key={schema.id} value={schema.id}>
              <span className="flex items-center gap-2">
                <span aria-hidden="true">{schema.icon}</span>
                <span>{schema.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
}
