import type { QueryTree } from "@/types/query";

export function createBenchmarkDemoTree(): QueryTree {
  return {
    schemaId: "users",
    version: 1,
    root: {
      type: "group",
      id: "root",
      logic: "AND",
      collapsed: false,
      label: "Benchmark demo",
      children: [
        { type: "rule", id: "demo-age", field: "age", operator: "greater_than", value: 30 },
        { type: "rule", id: "demo-status", field: "status", operator: "equals", value: "active" },
        {
          type: "group",
          id: "demo-market-signal",
          logic: "OR",
          collapsed: false,
          label: "Market signal",
          children: [
            { type: "rule", id: "demo-country", field: "country", operator: "equals", value: "NG" },
            { type: "rule", id: "demo-purchases", field: "purchases", operator: "greater_than", value: 20 }
          ]
        },
        {
          type: "group",
          id: "demo-quality-window",
          logic: "AND",
          collapsed: false,
          label: "Quality window",
          children: [
            { type: "rule", id: "demo-verified", field: "isVerified", operator: "equals", value: true },
            { type: "rule", id: "demo-created", field: "createdAt", operator: "date_between", value: "2025-01-15", secondValue: "2025-03-20" }
          ]
        }
      ]
    }
  };
}
