/**
 * Master vendor fields such as `category`, `city`, `state`, `country`,
 * `tags`, and `serviceAreas` can arrive in several different shapes
 * depending on how they were written to the DB:
 *
 *   1. A Postgres array literal string   ->  {"IT Hardware"}   or  {a,b,c}
 *   2. A JSON array string               ->  ["Desktop"]
 *   3. A plain comma-separated string    ->  "IT Hardware, Electronics"
 *   4. A real JS array (already parsed)  ->  ["IT Hardware"]
 *   5. A plain single string             ->  "IT Hardware"
 *   6. null / undefined
 *
 * parseFlexibleArrayField() normalizes all of the above into a clean,
 * quote/brace-free string[] so matching and display logic never has to
 * care which format a given row happened to be stored in.
 */
export function parseFlexibleArrayField(value: unknown): string[] {
  if (value === null || value === undefined) return [];

  // Already a real array
  if (Array.isArray(value)) {
    return value
      .filter((v) => typeof v === "string" || typeof v === "number")
      .map((v) => String(v).trim())
      .filter(Boolean);
  }

  if (typeof value !== "string") return [];

  const trimmed = value.trim();
  if (!trimmed) return [];

  // JSON array string: ["a","b"]
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((v) => typeof v === "string" || typeof v === "number")
          .map((v) => String(v).trim())
          .filter(Boolean);
      }
    } catch {
      // Not valid JSON — fall through to other strategies below
    }
  }

  // Postgres array literal string: {"a","b"} or {a,b}
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    const inner = trimmed.slice(1, -1);
    if (!inner) return [];
    // Matches either a "quoted, comma-safe" chunk or an unquoted chunk
    const parts = inner.match(/(?:"([^"]*)")|([^,]+)/g) || [];
    return parts.map((p) => p.replace(/^"|"$/g, "").trim()).filter(Boolean);
  }

  // Plain comma-separated fallback, or a single plain value
  return trimmed
    .split(",")
    .map((v) => v.replace(/[\[\]{}"']/g, "").trim())
    .filter(Boolean);
}

/** Joins parsed values into a clean, human-readable display string. */
export function displayFlexibleArrayField(
  value: unknown,
  separator = ", ",
): string {
  return parseFlexibleArrayField(value).join(separator);
}
