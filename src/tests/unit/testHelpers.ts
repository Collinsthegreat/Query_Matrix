import type { QueryTree, RuleNode } from "@/types/query";

export function singleRuleTree(rule: Partial<RuleNode> = {}): QueryTree {
  return {
    schemaId: "users",
    version: 1,
    root: {
      type: "group",
      id: "root",
      logic: "AND",
      collapsed: false,
      children: [{
        type: "rule",
        id: "r1",
        field: "age",
        operator: "greater_than",
        value: 18,
        ...rule
      }]
    }
  };
}

export function nestedTree(): QueryTree {
  return {
    schemaId: "users",
    version: 1,
    root: {
      type: "group",
      id: "root",
      logic: "AND",
      collapsed: false,
      children: [
        { type: "rule", id: "r1", field: "age", operator: "greater_than", value: 18 },
        {
          type: "group",
          id: "g1",
          logic: "OR",
          collapsed: false,
          children: [
            { type: "rule", id: "r2", field: "country", operator: "equals", value: "NG" },
            { type: "rule", id: "r3", field: "purchases", operator: "greater_than", value: 10 }
          ]
        }
      ]
    }
  };
}
