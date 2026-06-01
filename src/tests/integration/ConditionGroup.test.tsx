import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { ConditionGroup } from "@/components/builder/ConditionGroup";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { getSchemaById } from "@/lib/constants";
import { detectConflicts, validateQuery } from "@/lib/validators";
import { nestedTree } from "../unit/testHelpers";
import { useQueryStore } from "@/stores/queryStore";

beforeEach(() => {
  useQueryStore.setState({ tree: nestedTree() });
});

describe("ConditionGroup Component", () => {
  it("renders nested groups recursively", () => {
    const tree = nestedTree();
    const schema = getSchemaById("users");
    const errors = new Map(validateQuery(tree, schema).errors.map((error) => [error.nodeId, error.message]));
    render(
      <TooltipProvider>
        <ConditionGroup node={tree.root} depth={0} parentId={null} isRoot schema={schema} errorsByNode={errors} conflicts={detectConflicts(tree, schema)} />
      </TooltipProvider>
    );
    expect(screen.getAllByRole("group", { name: /Condition group/i })).toHaveLength(2);
  });

  it("shows conflict warning with expandable Learn why control", async () => {
    const tree = nestedTree();
    tree.root.children.push({ type: "rule", id: "r4", field: "age", operator: "less_than", value: 10 });
    const schema = getSchemaById("users");
    render(
      <TooltipProvider>
        <ConditionGroup node={tree.root} depth={0} parentId={null} isRoot schema={schema} errorsByNode={new Map()} conflicts={detectConflicts(tree, schema)} />
      </TooltipProvider>
    );
    await userEvent.click(screen.getByRole("button", { name: /Learn why/i }));
    expect(screen.getByText(/Conflicting range/i)).toBeInTheDocument();
  });
});
