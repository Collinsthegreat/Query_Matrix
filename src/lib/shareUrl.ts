import type { BuilderView } from "@/stores/settingsStore";
import type { QueryTree } from "@/types/query";
import { validateImportedQueryTree } from "./importValidation";

type SharePayload = {
  tree: QueryTree;
  viewMode: BuilderView;
};

type ShareDecodeResult =
  | { valid: true; tree: QueryTree; viewMode: BuilderView }
  | { valid: false; error: string };

function stringToCodes(input: string): number[] {
  if (!input) return [];
  const dict = new Map<string, number>();
  const output: number[] = [];
  const chars = Array.from(input);
  let phrase = chars[0] ?? "";
  let code = 256;
  for (const char of chars.slice(1)) {
    const next = phrase + char;
    if (dict.has(next)) {
      phrase = next;
    } else {
      output.push(phrase.length === 1 ? phrase.charCodeAt(0) : dict.get(phrase) ?? phrase.charCodeAt(0));
      if (code <= 65535) dict.set(next, code++);
      phrase = char;
    }
  }
  if (phrase) output.push(phrase.length === 1 ? phrase.charCodeAt(0) : dict.get(phrase) ?? phrase.charCodeAt(0));
  return output;
}

function codesToString(codes: number[]): string {
  if (codes.length === 0) return "";
  const dict = new Map<number, string>();
  let code = 256;
  let phrase = String.fromCharCode(codes[0]!);
  let output = phrase;
  for (const current of codes.slice(1)) {
    const entry = current < 256 ? String.fromCharCode(current) : dict.get(current) ?? `${phrase}${phrase[0] ?? ""}`;
    output += entry;
    if (code <= 65535) dict.set(code++, `${phrase}${entry[0] ?? ""}`);
    phrase = entry;
  }
  return output;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  const base64 = typeof btoa === "function"
    ? btoa(binary)
    : Buffer.from(bytes).toString("base64");
  return base64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = typeof atob === "function"
    ? atob(base64)
    : Buffer.from(base64, "base64").toString("binary");
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function compress(input: string): string {
  const codes = stringToCodes(input);
  const bytes = new Uint8Array(codes.length * 2);
  codes.forEach((code, index) => {
    bytes[index * 2] = code >> 8;
    bytes[index * 2 + 1] = code & 255;
  });
  return bytesToBase64Url(bytes);
}

function decompress(input: string): string {
  const bytes = base64UrlToBytes(input);
  const codes: number[] = [];
  for (let index = 0; index < bytes.length; index += 2) {
    codes.push(((bytes[index] ?? 0) << 8) | (bytes[index + 1] ?? 0));
  }
  return codesToString(codes);
}

export function buildShareUrl(baseUrl: string, tree: QueryTree, viewMode: BuilderView): string {
  const url = new URL(baseUrl);
  const payload: SharePayload = { tree, viewMode };
  url.searchParams.set("qf", compress(encodeURIComponent(JSON.stringify(payload))));
  return url.toString();
}

export function decodeShareUrl(urlValue: string): ShareDecodeResult {
  try {
    const url = new URL(urlValue);
    const encoded = url.searchParams.get("qf");
    if (!encoded) return { valid: false, error: "No QueryMatrix share payload found." };
    const payload = JSON.parse(decodeURIComponent(decompress(encoded))) as unknown;
    if (typeof payload !== "object" || payload === null || !("tree" in payload)) {
      throw new Error("Share payload is malformed.");
    }
    const treeResult = validateImportedQueryTree((payload as { tree: unknown }).tree);
    if (!treeResult.valid) throw new Error(treeResult.error);
    const viewMode = (payload as { viewMode?: unknown }).viewMode === "graph" ? "graph" : "form";
    return { valid: true, tree: treeResult.tree, viewMode };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : "Share URL could not be decoded." };
  }
}
