// src/lib/dates.ts

export type DateInput = Date | string | number | null | undefined;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Returns YYYY-MM-DD without timezone surprises.
 * - If value is "YYYY-MM-DD", returns it unchanged.
 * - If value is Date/number, uses local time components.
 * - Invalid/empty input → "".
 */
export function isoDate(value: DateInput): string {
  if (value == null || value === "") return "";

  // Handle plain YYYY-MM-DD strings explicitly (avoid UTC parsing)
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return isoDate(new Date());
}
