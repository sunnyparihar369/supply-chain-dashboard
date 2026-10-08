// ─────────────────────────────────────────────────────────────────────────────
// Supply chain replenishment math — the single source of truth for the app.
//
// Every formula below is a pure function so it can be unit-tested in isolation
// and pointed to directly in an interview ("here's exactly where the reorder
// point formula lives"). Nothing here touches React, the DOM, or the CSV parser.
//
// The four core formulas (v1 uses the simplified safety stock, which needs only
// max/average daily demand rather than a full standard deviation of demand):
//
//   safety_stock   = (max_daily_demand − avg_daily_demand) × lead_time_days
//   reorder_point  = (avg_daily_demand × lead_time_days) + safety_stock
//   days_of_supply = current_stock ÷ avg_daily_demand
//   stockout risk  = current_stock ≤ reorder_point
// ─────────────────────────────────────────────────────────────────────────────

import type {
  InventoryInput,
  RiskLevel,
  SkuMetrics,
  Summary,
} from "./types";

/** Warning band multiplier: within +25% of the reorder point is "approaching". */
export const WARNING_MULTIPLIER = 1.25;

/**
 * Simplified safety stock — buffer against demand spikes during the lead time.
 * Uses the gap between peak and average daily demand rather than a statistical
 * standard deviation, so it is explainable in one sentence.
 */
export function safetyStock(
  maxDailyDemand: number,
  avgDailyDemand: number,
  leadTimeDays: number,
): number {
  return (maxDailyDemand - avgDailyDemand) * leadTimeDays;
}

/**
 * Reorder point — the stock level at which a replenishment order should be
 * placed so new units arrive before stock runs out. It covers expected demand
 * across the lead time plus the safety buffer.
 */
export function reorderPoint(
  avgDailyDemand: number,
  leadTimeDays: number,
  safety: number,
): number {
  return avgDailyDemand * leadTimeDays + safety;
}

/**
 * Days of supply — how many days current stock lasts at the average burn rate.
 * Returns null ("N/A") when there is no demand, to avoid dividing by zero.
 */
export function daysOfSupply(
  currentStock: number,
  avgDailyDemand: number,
): number | null {
  if (avgDailyDemand === 0) return null;
  return currentStock / avgDailyDemand;
}

/**
 * Classify a SKU's risk. Order matters: check the most severe band first.
 * No demand (avgDailyDemand === 0) means no stockout risk → always Healthy,
 * even though the reorder point math would otherwise flag it.
 */
export function riskLevel(
  currentStock: number,
  avgDailyDemand: number,
  reorder: number,
): RiskLevel {
  if (avgDailyDemand === 0) return "healthy";
  if (currentStock <= reorder) return "critical";
  if (currentStock <= reorder * WARNING_MULTIPLIER) return "warning";
  return "healthy";
}

/** Compute every derived metric for one validated SKU input. */
export function analyzeInput(input: InventoryInput): SkuMetrics {
  const safety = safetyStock(
    input.maxDailyDemand,
    input.avgDailyDemand,
    input.leadTimeDays,
  );
  const reorder = reorderPoint(
    input.avgDailyDemand,
    input.leadTimeDays,
    safety,
  );

  return {
    ...input,
    safetyStock: safety,
    reorderPoint: reorder,
    warningThreshold: reorder * WARNING_MULTIPLIER,
    daysOfSupply: daysOfSupply(input.currentStock, input.avgDailyDemand),
    inventoryValue:
      input.unitCost === undefined
        ? null
        : input.currentStock * input.unitCost,
    risk: riskLevel(input.currentStock, input.avgDailyDemand, reorder),
  };
}

/** Roll up a set of analyzed SKUs into the portfolio-level summary. */
export function summarize(rows: SkuMetrics[]): Summary {
  const criticalCount = rows.filter((r) => r.risk === "critical").length;
  const warningCount = rows.filter((r) => r.risk === "warning").length;
  const healthyCount = rows.filter((r) => r.risk === "healthy").length;

  const valuedRows = rows.filter((r) => r.inventoryValue !== null);
  const totalInventoryValue =
    valuedRows.length === 0
      ? null
      : valuedRows.reduce((sum, r) => sum + (r.inventoryValue ?? 0), 0);

  return {
    totalSkus: rows.length,
    atRiskSkus: criticalCount + warningCount,
    criticalCount,
    warningCount,
    healthyCount,
    totalInventoryValue,
  };
}
