"use client";

import { GitBranchPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";

export function AddRuleButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip content="Add rule (A)">
      <Button type="button" variant="secondary" size="sm" onClick={onClick}>
        <Plus aria-hidden="true" size={15} />
        Add Rule
      </Button>
    </Tooltip>
  );
}

export function AddGroupButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip content="Add group (G)">
      <Button type="button" variant="secondary" size="sm" onClick={onClick}>
        <GitBranchPlus aria-hidden="true" size={15} />
        Add Group
      </Button>
    </Tooltip>
  );
}
