import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AccessibleQueryOutline } from "@/components/shared/AccessibleQueryOutline";
import { getSchemaById } from "@/lib/constants";
import { nestedTree } from "../unit/testHelpers";

describe("AccessibleQueryOutline Component", () => {
  it("renders a semantic outline of nested query groups", () => {
    render(<AccessibleQueryOutline tree={nestedTree()} schema={getSchemaById("users")} />);

    expect(screen.getByText("Screen reader outline")).toBeInTheDocument();
    expect(screen.getByLabelText("Accessible query outline")).toHaveTextContent("Root group using AND logic");
    expect(screen.getByLabelText("Accessible query outline")).toHaveTextContent("Country equals NG");
  });
});
