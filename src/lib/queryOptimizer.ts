import type { GroupNode, QueryNode, QueryTree, RuleNode } from "@/types/query";
import type { Schema } from "@/types/schema";

export type OptimizationSuggestion = {
  id: string;
  groupId: string;
  nodeId?: string;
  message: string;
  actionLabel?: string;
};

function ruleLabel(rule: RuleNode, schema: Schema): string {
  return schema.fields.find((field) => field.key === rule.field)?.label ?? rule.field;
}

function strongerGreater(rule: RuleNode): number {
  return Number(rule.value);
}

function strongerLess(rule: RuleNode): number {
  return Number(rule.value);
}

function collectGroupSuggestions(group: GroupNode, schema: Schema): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];
  const rules = group.children.filter((child): child is RuleNode => child.type === "rule");
  const byField = new Map<string, RuleNode[]>();
  rules.forEach((rule) => byField.set(rule.field, [...(byField.get(rule.field) ?? []), rule]));

  byField.forEach((fieldRules, field) => {
    const label = ruleLabel(fieldRules[0]!, schema);
    const duplicates = new Map<string, RuleNode[]>();
    fieldRules
      .filter((rule) => rule.operator === "equals")
      .forEach((rule) => {
        const key = String(rule.value);
        duplicates.set(key, [...(duplicates.get(key) ?? []), rule]);
      });
    duplicates.forEach((duplicateRules, value) => {
      duplicateRules.slice(1).forEach((rule) => {
        suggestions.push({
          id: `duplicate-${group.id}-${rule.id}`,
          groupId: group.id,
          nodeId: rule.id,
          message: `${label} equals ${value} appears more than once.`,
          actionLabel: "Remove duplicate"
        });
      });
    });

    if (group.logic !== "AND") return;
    const greater = fieldRules.filter((rule) => rule.operator === "greater_than" || rule.operator === "greater_than_or_equal").filter((rule) => !Number.isNaN(Number(rule.value)));
    const strongestGreater = greater.reduce<RuleNode | null>((best, rule) => !best || strongerGreater(rule) > strongerGreater(best) ? rule : best, null);
    greater.filter((rule) => strongestGreater && rule.id !== strongestGreater.id && strongerGreater(rule) <= strongerGreater(strongestGreater)).forEach((rule) => {
      suggestions.push({
        id: `greater-${group.id}-${rule.id}`,
        groupId: group.id,
        nodeId: rule.id,
        message: `${label} ${rule.operator === "greater_than" ? ">" : ">="} ${rule.value} is redundant because a stricter lower bound already exists.`,
        actionLabel: "Remove weaker rule"
      });
    });

    const lesser = fieldRules.filter((rule) => rule.operator === "less_than" || rule.operator === "less_than_or_equal").filter((rule) => !Number.isNaN(Number(rule.value)));
    const strongestLess = lesser.reduce<RuleNode | null>((best, rule) => !best || strongerLess(rule) < strongerLess(best) ? rule : best, null);
    lesser.filter((rule) => strongestLess && rule.id !== strongestLess.id && strongerLess(rule) >= strongerLess(strongestLess)).forEach((rule) => {
      suggestions.push({
        id: `less-${group.id}-${rule.id}`,
        groupId: group.id,
        nodeId: rule.id,
        message: `${label} ${rule.operator === "less_than" ? "<" : "<="} ${rule.value} is redundant because a stricter upper bound already exists.`,
        actionLabel: "Remove weaker rule"
      });
    });
  });

  return suggestions;
}

function walk(node: QueryNode, schema: Schema): OptimizationSuggestion[] {
  if (node.type === "rule") return [];
  return [
    ...collectGroupSuggestions(node, schema),
    ...node.children.flatMap((child) => walk(child, schema))
  ];
}

export function suggestOptimizations(tree: QueryTree, schema: Schema): OptimizationSuggestion[] {
  return walk(tree.root, schema).slice(0, 5);
}
