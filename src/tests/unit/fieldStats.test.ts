import { describe, expect, it } from "vitest";
import { getFieldStats } from "@/lib/fieldStats";

describe("fieldStats", () => {
  it("summarizes numeric field intelligence", () => {
    const stats = getFieldStats([
      { age: 18 },
      { age: 24 },
      { age: null },
      { age: 30 }
    ], { key: "age", label: "Age", type: "number" });

    expect(stats.min).toBe(18);
    expect(stats.max).toBe(30);
    expect(stats.mean).toBe(24);
    expect(stats.nullCount).toBe(1);
  });
});
