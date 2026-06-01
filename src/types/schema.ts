import type { FieldType } from "./query";

export type EnumOption = { label: string; value: string };

export type SchemaField = {
  key: string;
  label: string;
  type: FieldType;
  enumOptions?: EnumOption[];
  min?: number;
  max?: number;
  placeholder?: string;
  icon?: string;
};

export type Schema = {
  id: string;
  name: string;
  icon: string;
  description: string;
  fields: SchemaField[];
  color: string;
};
