"use client";

import { GitBranchPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";

export function AddRuleButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip content="Add rule (A)">
      <Button type="button" variant="secondary" size="sm" className="border-dashed bg-transparent text-[var(--text-muted)] hover:border-solid hover:border-[var(--primary)] hover:bg-[var(--primary-muted)] hover:text-[var(--primary)]" onClick={onClick}>
        <Plus aria-hidden="true" size={15} />
        Add Rule
      </Button>
    </Tooltip>
  );
}

export function AddGroupButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip content="Add group (G)">
      <Button type="button" variant="secondary" size="sm" className="border-dashed bg-transparent text-[var(--text-muted)] hover:border-solid hover:border-[var(--primary)] hover:bg-[var(--primary-muted)] hover:text-[var(--primary)]" onClick={onClick}>
        <GitBranchPlus aria-hidden="true" size={15} />
        Add Group
      </Button>
    </Tooltip>
  );
}
