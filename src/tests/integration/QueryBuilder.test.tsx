import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { QueryBuilder } from "@/components/builder/QueryBuilder";
import { QuerySimulator } from "@/components/simulator/QuerySimulator";
import { generateSQL } from "@/lib/generators";
import { getSchemaById } from "@/lib/constants";
import { createInitialTree, treeUtils } from "@/lib/treeUtils";
import { useHistoryStore } from "@/stores/historyStore";
import { useQueryStore } from "@/stores/queryStore";

function renderBuilder() {
  return render(
    <TooltipProvider>
      <QueryBuilder />
    </TooltipProvider>
  );
}

beforeEach(() => {
  useQueryStore.setState({ tree: createInitialTree("users") });
  useHistoryStore.setState({ entries: [], lastRunAt: null, lastResult: null, nodeMatches: {}, highlightedNodeId: null });
});

describe("QueryBuilder Component", () => {
  it("renders initial empty state with one group", () => {
    renderBuilder();
    expect(screen.getByText("Start with a rule or group")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /Condition group, AND logic/i })).toBeInTheDocument();
  });

  it("adds a rule when Add Rule is clicked", async () => {
    renderBuilder();
    await userEvent.click(screen.getByRole("button", { name: /Add Rule/i }));
    expect(useQueryStore.getState().tree.root.children[0]?.type).toBe("rule");
  });

  it("removes a rule when delete is clicked", async () => {
    useQueryStore.setState({ tree: treeUtils.addRule(createInitialTree("users"), "root") });
    renderBuilder();
    await userEvent.click(screen.getByRole("button", { name: /Delete rule/i }));
    expect(useQueryStore.getState().tree.root.children).toHaveLength(0);
  });

  it("toggles group logic between AND and OR", async () => {
    renderBuilder();
    await userEvent.click(screen.getByRole("radio", { name: "OR" }));
    expect(useQueryStore.getState().tree.root.logic).toBe("OR");
  });

  it("adds nested group when Add Group is clicked", async () => {
    renderBuilder();
    await userEvent.click(screen.getByRole("button", { name: /Add Group/i }));
    expect(useQueryStore.getState().tree.root.children[0]?.type).toBe("group");
  });

  it("collapses group when collapse button clicked", async () => {
    renderBuilder();
    await userEvent.click(screen.getByRole("button", { name: /Collapse condition group/i }));
    expect(useQueryStore.getState().tree.root.collapsed).toBe(true);
  });

  it("updates preview panel when rule is changed", () => {
    const withRule = treeUtils.addRule(createInitialTree("users"), "root");
    const ruleId = withRule.root.children[0]?.id ?? "";
    const updated = treeUtils.updateRule(withRule, ruleId, { field: "status", operator: "equals", value: "active" });
    expect(generateSQL(updated, getSchemaById("users"))).toContain("status = 'active'");
  });

  it("shows validation errors on invalid rules", async () => {
    useQueryStore.setState({ tree: treeUtils.addRule(createInitialTree("users"), "root") });
    renderBuilder();
    await userEvent.click(screen.getByRole("button", { name: /Add Rule/i }));
    expect(await screen.findAllByRole("alert")).not.toHaveLength(0);
  });

  it("run query button triggers simulation", async () => {
    render(
      <TooltipProvider>
        <QuerySimulator />
      </TooltipProvider>
    );
    await userEvent.click(screen.getByRole("button", { name: /Run Query/i }));
    await waitFor(() => expect(useHistoryStore.getState().lastResult).not.toBeNull(), { timeout: 1200 });
  });
});
