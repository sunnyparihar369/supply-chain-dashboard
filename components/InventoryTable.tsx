"use client";

import { Fragment, useMemo, useState } from "react";
import type { RiskLevel, SkuMetrics } from "@/lib/types";
import { formatCurrency, formatDays, formatUnits } from "@/lib/format";
import { WARNING_MULTIPLIER } from "@/lib/calculations";
import { ChevronIcon, SortIcon } from "./icons";
import { RISK_META, RiskBadge } from "./risk";

type SortKey = "sku" | "currentStock" | "reorderPoint" | "daysOfSupply" | "risk";
type SortDir = "asc" | "desc";

// Critical sorts ahead of warning ahead of healthy when ranking by risk.
const RISK_RANK: Record<RiskLevel, number> = { critical: 0, warning: 1, healthy: 2 };

const COLUMNS: { key: SortKey; label: string; align: "left" | "right" }[] = [
  { key: "sku", label: "SKU", align: "left" },
  { key: "currentStock", label: "Current Stock", align: "right" },
  { key: "reorderPoint", label: "Reorder Point", align: "right" },
  { key: "daysOfSupply", label: "Days of Supply", align: "right" },
  { key: "risk", label: "Risk", align: "left" },
];

function compare(a: SkuMetrics, b: SkuMetrics, key: SortKey, dir: SortDir): number {
  const mult = dir === "asc" ? 1 : -1;
  // Days of supply can be null (no demand) — those always sink to the bottom.
  if (key === "daysOfSupply") {
    const av = a.daysOfSupply;
    const bv = b.daysOfSupply;
    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;
    return (av - bv) * mult;
  }
  if (key === "sku") return a.sku.localeCompare(b.sku) * mult;
  const val = (r: SkuMetrics) =>
    key === "risk" ? RISK_RANK[r.risk] : (r[key] as number);
  return (val(a) - val(b)) * mult;
}

export function InventoryTable({ rows }: { rows: SkuMetrics[] }) {
  // Default view leads with the SKUs that need attention.
  const [sortKey, setSortKey] = useState<SortKey>("risk");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => compare(a, b, sortKey, sortDir)),
    [rows, sortKey, sortDir],
  );

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      // Text sorts A→Z by default; everything numeric leads with the largest.
      setSortDir(key === "sku" ? "asc" : "desc");
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-hairline)] bg-[var(--color-surface-2)]">
              <th className="w-8" aria-label="Expand" />
              {COLUMNS.map((col) => {
                const active = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    aria-sort={
                      active
                        ? sortDir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    className={`px-3 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-2)] ${
                      col.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={`inline-flex items-center gap-1 hover:text-[var(--color-ink)] ${
                        col.align === "right" ? "flex-row-reverse" : ""
                      }`}
                    >
                      {col.label}
                      <SortIcon
                        dir={active ? sortDir : null}
                        className={
                          active
                            ? "text-[var(--color-accent)]"
                            : "text-[var(--color-muted)]"
                        }
                      />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length + 1}
                  className="px-3 py-12 text-center text-sm text-[var(--color-muted)]"
                >
                  No SKUs match your filters.
                </td>
              </tr>
            )}
            {sorted.map((row) => {
              const isOpen = expanded === row.sku;
              const meta = RISK_META[row.risk];
              return (
                <Fragment key={row.sku}>
                  <tr
                    onClick={() => setExpanded(isOpen ? null : row.sku)}
                    className="cursor-pointer border-b border-[var(--color-hairline)] transition-colors hover:bg-[var(--color-surface-2)]"
                  >
                    <td
                      className="py-3 pl-3 pr-1"
                      style={{ borderLeft: `3px solid ${meta.color}` }}
                    >
                      <ChevronIcon
                        width={16}
                        height={16}
                        aria-hidden
                        className={`text-[var(--color-muted)] transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </td>
                    <td className="px-3 py-3 font-medium text-[var(--color-ink)]">
                      {row.sku}
                    </td>
                    <td className="tnum px-3 py-3 text-right text-[var(--color-ink-2)]">
                      {formatUnits(row.currentStock)}
                    </td>
                    <td className="tnum px-3 py-3 text-right text-[var(--color-ink-2)]">
                      {formatUnits(row.reorderPoint)}
                    </td>
                    <td className="tnum px-3 py-3 text-right text-[var(--color-ink-2)]">
                      {formatDays(row.daysOfSupply)}
                    </td>
                    <td className="px-3 py-3">
                      <RiskBadge risk={row.risk} />
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="border-b border-[var(--color-hairline)] bg-[var(--color-surface-2)]">
                      <td
                        colSpan={COLUMNS.length + 1}
                        className="px-4 py-4"
                        style={{ borderLeft: `3px solid ${meta.color}` }}
                      >
                        <Breakdown row={row} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
/** The "show your work" panel — every formula with this SKU's numbers plugged in. */
function Breakdown({ row }: { row: SkuMetrics }) {
  const meta = RISK_META[row.risk];
  const { Icon } = meta;
  const noDemand = row.avgDailyDemand === 0;

  const steps = [
    {
      label: "Safety stock",
      formula: "(max − avg daily demand) × lead time",
      calc: `(${formatUnits(row.maxDailyDemand)} − ${formatUnits(
        row.avgDailyDemand,
      )}) × ${formatUnits(row.leadTimeDays)}`,
      result: `${formatUnits(row.safetyStock)} units`,
    },
    {
      label: "Reorder point",
      formula: "(avg daily demand × lead time) + safety stock",
      calc: `(${formatUnits(row.avgDailyDemand)} × ${formatUnits(
        row.leadTimeDays,
      )}) + ${formatUnits(row.safetyStock)}`,
      result: `${formatUnits(row.reorderPoint)} units`,
    },
    {
      label: "Days of supply",
      formula: "current stock ÷ avg daily demand",
      calc: noDemand
        ? "no daily demand → N/A"
        : `${formatUnits(row.currentStock)} ÷ ${formatUnits(row.avgDailyDemand)}`,
      result: formatDays(row.daysOfSupply),
    },
    {
      label: "Warning threshold",
      formula: `reorder point × ${WARNING_MULTIPLIER}`,
      calc: `${formatUnits(row.reorderPoint)} × ${WARNING_MULTIPLIER}`,
      result: `${formatUnits(row.warningThreshold)} units`,
    },
  ];

  if (row.inventoryValue !== null) {
    steps.push({
      label: "Inventory value",
      formula: "current stock × unit cost",
      calc: `${formatUnits(row.currentStock)} × ${formatCurrency(row.unitCost ?? 0)}`,
      result: formatCurrency(row.inventoryValue),
    });
  }

  const verdict = noDemand
    ? "No daily demand recorded, so there is no stockout risk."
    : row.risk === "critical"
      ? `Current stock (${formatUnits(
          row.currentStock,
        )}) is at or below the reorder point (${formatUnits(row.reorderPoint)}).`
      : row.risk === "warning"
        ? `Current stock (${formatUnits(row.currentStock)}) is within ${Math.round(
            (WARNING_MULTIPLIER - 1) * 100,
          )}% of the reorder point (${formatUnits(row.reorderPoint)}).`
        : `Current stock (${formatUnits(
            row.currentStock,
          )}) sits comfortably above the reorder point (${formatUnits(
            row.reorderPoint,
          )}).`;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_15rem]">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          How this was calculated
        </h4>
        <dl className="mt-2 space-y-1.5">
          {steps.map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-0.5 border-b border-[var(--color-hairline)] pb-1.5 last:border-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
            >
              <dt className="text-sm font-medium text-[var(--color-ink)]">
                {s.label}
              </dt>
              <dd className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs">
                <span className="text-[var(--color-muted)]">{s.formula}</span>
                <span className="font-mono text-[var(--color-ink-2)]">
                  = {s.calc}
                </span>
                <span className="tnum font-mono font-semibold text-[var(--color-ink)]">
                  = {s.result}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <aside
        className="flex flex-col gap-1 self-start rounded-lg p-3"
        style={{ backgroundColor: meta.tint, color: meta.text }}
      >
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <Icon width={14} height={14} aria-hidden />
          {meta.action}
        </span>
        <span className="text-xs leading-relaxed">{verdict}</span>
      </aside>
    </div>
  );
}

