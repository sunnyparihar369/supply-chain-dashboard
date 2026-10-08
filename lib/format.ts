// Display formatting helpers. Kept separate from calculations so the math stays
// pure numbers and the UI decides how to render them.

/** Whole-number units with thousands separators, e.g. 12,000. */
export function formatUnits(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

/** Compact currency, e.g. $1,234 or $1.2M for large inventory values. */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: value >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value);
}

/** Days of supply, one decimal, or "N/A" when demand is zero. */
export function formatDays(value: number | null): string {
  if (value === null) return "N/A";
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} days`;
}

/** A number with up to one decimal, dropping a trailing ".0". */
export function formatNumber(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
}
