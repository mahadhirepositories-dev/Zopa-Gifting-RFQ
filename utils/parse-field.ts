import { parseFlexibleArrayField, displayFlexibleArrayField } from "@/lib/vendor-field-parse";

export function parseDisplayField(value: unknown): string[] {
  return parseFlexibleArrayField(value);
}

export function parseDisplayFieldAsString(value: unknown): string {
  return displayFlexibleArrayField(value);
}
