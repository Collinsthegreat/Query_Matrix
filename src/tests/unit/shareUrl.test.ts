import { describe, expect, it } from "vitest";
import { buildShareUrl, decodeShareUrl } from "@/lib/shareUrl";
import { singleRuleTree } from "./testHelpers";

describe("shareUrl", () => {
  it("round-trips a query tree through a compressed URL payload", () => {
    const tree = singleRuleTree();
    const url = buildShareUrl("https://queryforge.test", tree, "graph");
    const result = decodeShareUrl(url);

    expect(url).toContain("qf=");
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.tree.root.children[0]?.id).toBe("r1");
      expect(result.viewMode).toBe("graph");
    }
  });
});
