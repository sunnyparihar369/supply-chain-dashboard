import type { InvalidRow } from "@/lib/types";
import { AlertIcon } from "./icons";

/**
 * Rows that failed validation. Kept out of the summary math and surfaced here
 * so nothing is silently dropped — the user can see exactly what to fix.
 */
export function DataIssues({ rows }: { rows: InvalidRow[] }) {
  if (rows.length === 0) return null;

  return (
    <section className="rounded-xl border border-[color-mix(in_srgb,var(--color-warning)_35%,var(--color-hairline))] bg-[color-mix(in_srgb,var(--color-warning)_5%,var(--color-surface))] p-5">
      <div className="flex items-center gap-2">
        <AlertIcon style={{ color: "var(--color-warning)" }} />
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">
          Data issues
        </h2>
        <span className="tnum rounded-full bg-[color-mix(in_srgb,var(--color-warning)_18%,var(--color-surface))] px-2 py-0.5 text-xs font-semibold text-[var(--color-ink-2)]">
          {rows.length} {rows.length === 1 ? "row" : "rows"} excluded
        </span>
      </div>
      <p className="mt-1 text-xs text-[var(--color-ink-2)]">
        These rows were left out of the analysis. Fix them in your source file
        and re-upload.
      </p>

      <ul className="mt-3 divide-y divide-[color-mix(in_srgb,var(--color-warning)_20%,var(--color-hairline))]">
        {rows.map((row) => (
          <li
            key={row.rowNumber}
            className="flex flex-col gap-1 py-2 sm:flex-row sm:items-baseline sm:gap-4"
          >
            <span className="min-w-0 text-sm font-medium text-[var(--color-ink)]">
              <span className="text-[var(--color-muted)]">Row {row.rowNumber}:</span>{" "}
              {row.sku}
            </span>
            <span className="flex flex-wrap gap-1.5">
              {row.issues.map((issue) => (
                <span
                  key={issue}
                  className="rounded-md bg-[color-mix(in_srgb,var(--color-warning)_14%,var(--color-surface))] px-2 py-0.5 text-xs font-medium text-[var(--color-ink-2)]"
                >
                  {issue}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
