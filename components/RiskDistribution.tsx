import type { RiskLevel, Summary } from "@/lib/types";
import { RISK_META } from "./risk";

const ORDER: RiskLevel[] = ["critical", "warning", "healthy"];

/**
 * A 100% stacked bar of the SKU portfolio by risk band. Segments double as
 * filters — clicking one narrows the table. Identity is carried by label +
 * count in the legend, never by color alone.
 */
export function RiskDistribution({
  summary,
  active,
  onSelect,
}: {
  summary: Summary;
  active: RiskLevel | "all";
  onSelect: (risk: RiskLevel) => void;
}) {
  const counts: Record<RiskLevel, number> = {
    critical: summary.criticalCount,
    warning: summary.warningCount,
    healthy: summary.healthyCount,
  };
  const total = summary.totalSkus || 1;

  return (
    <div className="rise rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">
          Risk distribution
        </h2>
        <span className="text-xs text-[var(--color-muted)]">
          {summary.totalSkus} SKUs
        </span>
      </div>

      <div
        className="mt-3 flex h-4 w-full gap-0.5 overflow-hidden rounded-full bg-[var(--color-surface-2)]"
        role="img"
        aria-label={`${counts.critical} critical, ${counts.warning} warning, ${counts.healthy} healthy`}
      >
        {ORDER.map((risk) => {
          const pct = (counts[risk] / total) * 100;
          if (pct === 0) return null;
          const meta = RISK_META[risk];
          const dim = active !== "all" && active !== risk;
          return (
            <button
              key={risk}
              type="button"
              onClick={() => onSelect(risk)}
              title={`${counts[risk]} ${meta.label} — click to filter`}
              className="h-full origin-left transition-opacity hover:opacity-90"
              style={{
                width: `${pct}%`,
                backgroundColor: meta.color,
                opacity: dim ? 0.28 : 1,
                animation: "growBar 0.6s cubic-bezier(0.22,1,0.36,1) both",
              }}
              aria-label={`Filter to ${meta.label} (${counts[risk]})`}
            />
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {ORDER.map((risk) => {
          const meta = RISK_META[risk];
          const pct = Math.round((counts[risk] / total) * 100);
          return (
            <button
              key={risk}
              type="button"
              onClick={() => onSelect(risk)}
              className="group flex items-center gap-2 text-left"
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: meta.color }}
                aria-hidden
              />
              <span className="text-sm font-medium text-[var(--color-ink)] group-hover:underline">
                {meta.label}
              </span>
              <span className="tnum text-sm text-[var(--color-ink-2)]">
                {counts[risk]}
              </span>
              <span className="text-xs text-[var(--color-muted)]">({pct}%)</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
