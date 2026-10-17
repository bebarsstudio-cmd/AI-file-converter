/**
 * Small pure parsing helpers shared by the AI route handlers — split out of
 * the route files so the unit tests can cover them directly.
 */

/** Removes markdown code fences a model may wrap its output in. */
export function stripCodeFences(text: string): string {
  let out = text.trim();
  if (out.startsWith("```")) {
    out = out.replace(/^```[^\n]*\n?/, "");
  }
  if (out.endsWith("```")) {
    out = out.replace(/\n?```\s*$/, "");
  }
  return out.trim();
}

/**
 * Narrows an unknown value to a plain JSON object. Arrays are not records
 * for our purposes — a request body or payload must be a `{...}`.
 */
export function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
