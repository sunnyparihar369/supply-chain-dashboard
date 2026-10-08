import type { Summary } from "@/lib/types";
import { formatCurrency, formatUnits } from "@/lib/format";
import { AlertIcon, BoxesIcon, ValueIcon } from "./icons";
import { RISK_META } from "./risk";

/** Portfolio KPI tiles. The hero number leads; context sits beneath it. */
export function SummaryCards({ summary }: { summary: Summary }) {
  const atRiskPct =
    summary.totalSkus === 0
      ? 0
      : Math.round((summary.atRiskSkus / summary.totalSkus) * 100);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Tile
        icon={<BoxesIcon className="text-[var(--color-accent)]" />}
        label="Total SKUs"
        value={formatUnits(summary.totalSkus)}
        footer="Valid rows analyzed"
      />

      <Tile
        icon={<AlertIcon style={{ color: RISK_META.critical.color }} />}
        label="At-Risk SKUs"
        value={formatUnits(summary.atRiskSkus)}
        accent={summary.atRiskSkus > 0 ? RISK_META.critical.color : undefined}
        footer={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Dot color={RISK_META.critical.color} />
            {summary.criticalCount} critical
            <Dot color={RISK_META.warning.color} />
            {summary.warningCount} warning
            <span className="text-[var(--color-muted)]">· {atRiskPct}% of total</span>
          </span>
        }
      />

      <Tile
        icon={<ValueIcon className="text-[var(--color-accent)]" />}
        label="Total Inventory Value"
        value={
          summary.totalInventoryValue === null
            ? "—"
            : formatCurrency(summary.totalInventoryValue)
        }
        footer={
          summary.totalInventoryValue === null
            ? "Add unit_cost to enable"
            : "Current stock × unit cost"
        }
      />
    </div>
  );
}

function Tile({
  icon,
  label,
  value,
  footer,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  footer: React.ReactNode;
  accent?: string;
}) {
  return (
    <div
      className="rise relative overflow-hidden rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]"
      style={
        accent
          ? { boxShadow: `inset 3px 0 0 ${accent}, var(--shadow-card)` }
          : undefined
      }
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          {label}
        </span>
        <span className="opacity-80">{icon}</span>
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
        {value}
      </div>
      <div className="mt-2 text-xs text-[var(--color-ink-2)]">{footer}</div>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2 w-2 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}
