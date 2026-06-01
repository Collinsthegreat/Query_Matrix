import { NextResponse } from "next/server";
import type { Operator, QueryTree, RuleNode } from "@/types/query";
import { OPERATOR_LABELS, SCHEMAS } from "@/lib/constants";
import { validateImportedQueryTree } from "@/lib/importValidation";

type RequestBody = {
  input: string;
  schemaId: string;
};

function isRequestBody(value: unknown): value is RequestBody {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as { input?: unknown; schemaId?: unknown };
  return typeof candidate.input === "string" && typeof candidate.schemaId === "string";
}

function rule(id: string, field: string, operator: Operator, value: unknown, secondValue?: unknown): RuleNode {
  return { type: "rule", id, field, operator, value, secondValue };
}

function fallbackTree(input: string, schemaId: string): QueryTree {
  const normalized = input.toLowerCase();
  const children: RuleNode[] = [];
  if (schemaId === "users") {
    if (normalized.includes("active")) children.push(rule("ai-status-active", "status", "equals", "active"));
    if (normalized.includes("nigeria")) children.push(rule("ai-country-ng", "country", "equals", "NG"));
    const ageMatch = normalized.match(/older than (\d+)|age over (\d+)|above (\d+)/);
    const age = ageMatch?.[1] ?? ageMatch?.[2] ?? ageMatch?.[3];
    if (age) children.push(rule("ai-age", "age", "greater_than", Number(age)));
    const purchasesMatch = normalized.match(/more than (\d+) purchase|over (\d+) purchase/);
    const purchases = purchasesMatch?.[1] ?? purchasesMatch?.[2];
    if (purchases) children.push(rule("ai-purchases", "purchases", "greater_than", Number(purchases)));
    if (normalized.includes("verified")) children.push(rule("ai-verified", "isVerified", "equals", true));
  } else if (schemaId === "orders") {
    if (normalized.includes("priority")) children.push(rule("ai-priority", "isPriority", "equals", true));
    if (normalized.includes("delivered")) children.push(rule("ai-delivered", "status", "equals", "delivered"));
    const amount = normalized.match(/over (\d+)|greater than (\d+)/);
    const value = amount?.[1] ?? amount?.[2];
    if (value) children.push(rule("ai-amount", "amount", "greater_than", Number(value)));
  } else if (schemaId === "products") {
    if (normalized.includes("active")) children.push(rule("ai-active-product", "isActive", "equals", true));
    if (normalized.includes("electronics")) children.push(rule("ai-category", "category", "equals", "electronics"));
    const rating = normalized.match(/rating (?:over|above) (\d+(?:\.\d+)?)/);
    if (rating?.[1]) children.push(rule("ai-rating", "rating", "greater_than", Number(rating[1])));
  } else {
    if (normalized.includes("bounce")) children.push(rule("ai-bounce", "isBounce", "equals", true));
    if (normalized.includes("social")) children.push(rule("ai-source", "source", "equals", "social"));
    const duration = normalized.match(/duration (?:over|above) (\d+)/);
    if (duration?.[1]) children.push(rule("ai-duration", "duration", "greater_than", Number(duration[1])));
  }
  return {
    root: { type: "group", id: "root", logic: "AND", children, collapsed: false, label: "AI generated query" },
    version: 1,
    schemaId
  };
}

function extractOpenAiContent(value: unknown): string | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as { choices?: Array<{ message?: { content?: string } }> };
  return candidate.choices?.[0]?.message?.content ?? null;
}

export async function POST(request: Request) {
  const body = (await request.json()) as unknown;
  if (!isRequestBody(body)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const schema = SCHEMAS.find((item) => item.id === body.schemaId) ?? SCHEMAS[0]!;
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const prompt = `
You are a query builder assistant. Convert the following natural language query
into a structured JSON QueryTree matching this TypeScript type:

type QueryNode = RuleNode | GroupNode
type GroupNode = { type: 'group', logic: 'AND'|'OR', children: QueryNode[], collapsed: false }
type RuleNode = { type: 'rule', field: string, operator: Operator, value: unknown }

Available fields for schema "${schema.name}":
${JSON.stringify(schema.fields.map((field) => ({ key: field.key, type: field.type })))}

Available operators: ${Object.keys(OPERATOR_LABELS).join(", ")}

Every group and rule must include a unique string id. The root group id must be "root".

Natural language query: "${body.input}"

Respond ONLY with valid JSON. No explanation. No markdown.
`;

  if (!apiKey) {
    return NextResponse.json({ tree: fallbackTree(body.input, schema.id), source: "fallback" });
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0
      })
    });
    const payload = (await response.json()) as unknown;
    const content = extractOpenAiContent(payload);
    if (!response.ok || !content) {
      return NextResponse.json({ tree: fallbackTree(body.input, schema.id), source: "fallback" });
    }
    const parsed = JSON.parse(content) as QueryTree;
    const result = validateImportedQueryTree({ ...parsed, schemaId: schema.id, version: parsed.version ?? 1 });
    if (!result.valid) {
      return NextResponse.json({ tree: fallbackTree(body.input, schema.id), source: "fallback" });
    }
    return NextResponse.json({ tree: result.tree, source: "ai" });
  } catch {
    return NextResponse.json({ tree: fallbackTree(body.input, schema.id), source: "fallback" });
  }
}
