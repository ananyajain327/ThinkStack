/** Safely parse a JSON string that should contain an array (backend stores lists as JSON text). */
export function parseList<T = string>(raw?: string | null): T[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

/** Safely parse a JSON string that should contain an object. */
export function parseObject<T = Record<string, unknown>>(raw?: string | null): T | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as T) : null
  } catch {
    return null
  }
}

/** Turn a comma-separated string into a trimmed list. */
export function splitCsv(value?: string | null): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}
