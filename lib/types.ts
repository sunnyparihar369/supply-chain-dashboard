// Domain types for the Supply Chain Risk & Reorder Dashboard.
// Kept isolated from UI so the analytics layer is easy to point to and test.

/** A single SKU's validated numeric inputs, parsed from the uploaded CSV. */
export interface InventoryInput {
  sku: string;
  currentStock: number;
  avgDailyDemand: number;
  maxDailyDemand: number;
  leadTimeDays: number;
  /** Optional — when present, enables inventory value calculations. */
  unitCost?: number;
}

/** Risk classification that drives row color. Ordered most → least severe. */
export type RiskLevel = "critical" | "warning" | "healthy";

/** A SKU with all replenishment metrics computed. */
export interface SkuMetrics extends InventoryInput {
  safetyStock: number;
  reorderPoint: number;
  /** reorderPoint * 1.25 — the Warning boundary, surfaced for the breakdown. */
  warningThreshold: number;
  /** null represents "N/A" (no demand → no meaningful days-of-supply). */
  daysOfSupply: number | null;
  /** null when unit_cost was not provided for this SKU. */
  inventoryValue: number | null;
  risk: RiskLevel;
}

/** A row that failed validation. Excluded from summary math, shown separately. */
export interface InvalidRow {
  /** 1-based data row number (excludes the header), for user reference. */
  rowNumber: number;
  sku: string;
  issues: string[];
  raw: Record<string, string>;
}

/** Portfolio-level rollup shown in the summary cards. */
export interface Summary {
  totalSkus: number;
  /** Critical + Warning. */
  atRiskSkus: number;
  criticalCount: number;
  warningCount: number;
  healthyCount: number;
  /** null when no valid SKU carried a unit_cost. */
  totalInventoryValue: number | null;
}

/** Full result of analyzing an uploaded file. */
export interface AnalysisResult {
  rows: SkuMetrics[];
  invalid: InvalidRow[];
  summary: Summary;
}
