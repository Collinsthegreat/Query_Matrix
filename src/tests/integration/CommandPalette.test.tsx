import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CommandPalette } from "@/components/palette/CommandPalette";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { createInitialTree } from "@/lib/treeUtils";
import { useQueryStore } from "@/stores/queryStore";

beforeEach(() => {
  useQueryStore.setState({ tree: createInitialTree("users") });
});

describe("CommandPalette Component", () => {
  it("filters commands with fuzzy search and executes selected command", async () => {
    const onOpenChange = vi.fn();
    render(
      <TooltipProvider>
        <CommandPalette open onOpenChange={onOpenChange} onRun={vi.fn()} onExportJson={vi.fn()} onImportJson={vi.fn()} onCopySql={vi.fn()} onLoadDemo={vi.fn()} onCopyShareUrl={vi.fn()} />
      </TooltipProvider>
    );
    await userEvent.type(screen.getByPlaceholderText("Search commands..."), "Add Rule");
    await userEvent.click(screen.getByText("Add Rule"));
    expect(useQueryStore.getState().tree.root.children[0]?.type).toBe("rule");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows shortcut badges for command actions", () => {
    render(
      <TooltipProvider>
        <CommandPalette open onOpenChange={vi.fn()} onRun={vi.fn()} onExportJson={vi.fn()} onImportJson={vi.fn()} onCopySql={vi.fn()} onLoadDemo={vi.fn()} onCopyShareUrl={vi.fn()} />
      </TooltipProvider>
    );
    expect(screen.getByText("⌘Z")).toBeInTheDocument();
    expect(screen.getByText("⌘⇧C")).toBeInTheDocument();
  });

  it("shows a power preview for the highlighted command", async () => {
    render(
      <TooltipProvider>
        <CommandPalette open onOpenChange={vi.fn()} onRun={vi.fn()} onExportJson={vi.fn()} onImportJson={vi.fn()} onCopySql={vi.fn()} onLoadDemo={vi.fn()} onCopyShareUrl={vi.fn()} />
      </TooltipProvider>
    );

    await userEvent.hover(screen.getByText("Load Benchmark Demo"));

    expect(screen.getByLabelText("Command preview")).toHaveTextContent("presentation-ready query");
  });
});
