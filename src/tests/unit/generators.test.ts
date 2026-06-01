import { describe, expect, it } from "vitest";
import { getSchemaById } from "@/lib/constants";
import { generateMongo, generateSQL } from "@/lib/generators";
import { nestedTree, singleRuleTree } from "./testHelpers";

const schema = getSchemaById("users");

describe("SQL Generator", () => {
  it("generates correct SQL for a single rule", () => {
    expect(generateSQL(singleRuleTree(), schema)).toContain("age > 18");
  });

  it("generates correct SQL for AND group", () => {
    const sql = generateSQL(singleRuleTree({ field: "status", operator: "equals", value: "active" }), schema);
    expect(sql).toContain("WHERE (");
    expect(sql).toContain("status = 'active'");
  });

  it("generates correct SQL for OR group", () => {
    const tree = nestedTree();
    expect(generateSQL(tree, schema)).toContain("OR");
  });

  it("generates correct SQL for nested groups", () => {
    const sql = generateSQL(nestedTree(), schema);
    expect(sql).toContain("AND");
    expect(sql).toContain("country = 'NG'");
    expect(sql).toContain("purchases > 10");
  });

  it("correctly quotes string values", () => {
    expect(generateSQL(singleRuleTree({ field: "status", operator: "equals", value: "active" }), schema)).toContain("'active'");
  });

  it("does not quote numeric values", () => {
    expect(generateSQL(singleRuleTree({ field: "age", operator: "greater_than", value: 21 }), schema)).toContain("age > 21");
  });

  it("handles null checks correctly", () => {
    expect(generateSQL(singleRuleTree({ field: "email", operator: "is_null", value: "" }), schema)).toContain("email IS NULL");
  });

  it("handles between operator with two values", () => {
    expect(generateSQL(singleRuleTree({ field: "age", operator: "between", value: 18, secondValue: 35 }), schema)).toContain("age BETWEEN 18 AND 35");
  });
});

describe("MongoDB Generator", () => {
  it("generates correct $and operator for AND groups", () => {
    expect(generateMongo(singleRuleTree(), schema)).toContain("\"$and\"");
  });

  it("generates correct $or operator for OR groups", () => {
    expect(generateMongo(nestedTree(), schema)).toContain("\"$or\"");
  });

  it("generates correct comparison operators", () => {
    expect(generateMongo(singleRuleTree(), schema)).toContain("\"$gt\": 18");
  });

  it("handles nested groups correctly", () => {
    const mongo = generateMongo(nestedTree(), schema);
    expect(mongo).toContain("\"country\": \"NG\"");
    expect(mongo).toContain("\"purchases\"");
  });
});
