import { describe, expect, it } from "vitest";
import {
  analyzeInput,
  daysOfSupply,
  reorderPoint,
  riskLevel,
  safetyStock,
  summarize,
  WARNING_MULTIPLIER,
} from "./calculations";
import type { SkuMetrics } from "./types";

// Expected values below are hand-calculated from the shipped sample CSV so the
// tests double as the "verify by hand" step from the build plan.

describe("safetyStock", () => {
  it("uses (max − avg) × lead time", () => {
    // 500ml PET Bottle: (1400 − 800) × 7 = 4200
    expect(safetyStock(1400, 800, 7)).toBe(4200);
    // Corrugated Carton: (90 − 45) × 14 = 630
    expect(safetyStock(90, 45, 14)).toBe(630);
  });
});

describe("reorderPoint", () => {
  it("adds lead-time demand to the safety buffer", () => {
    // 500ml PET Bottle: 800 × 7 + 4200 = 9800
    expect(reorderPoint(800, 7, 4200)).toBe(9800);
    // Crown Cap: 2000 × 5 + 6000 = 16000
    expect(reorderPoint(2000, 5, 6000)).toBe(16000);
  });
});

describe("daysOfSupply", () => {
  it("divides stock by average daily demand", () => {
    expect(daysOfSupply(12000, 800)).toBe(15);
    expect(daysOfSupply(25000, 2000)).toBe(12.5);
  });

  it("returns null (N/A) when demand is zero", () => {
    expect(daysOfSupply(100, 0)).toBeNull();
  });
});

describe("riskLevel", () => {
  it("flags Critical when stock is at or below the reorder point", () => {
    expect(riskLevel(300, 45, 1260)).toBe("critical"); // Corrugated Carton
    expect(riskLevel(1260, 45, 1260)).toBe("critical"); // exact boundary
  });

  it("flags Warning within +25% of the reorder point", () => {
    expect(riskLevel(12000, 800, 9800)).toBe("warning"); // 500ml PET Bottle
    expect(riskLevel(9800 * WARNING_MULTIPLIER, 800, 9800)).toBe("warning"); // exact 1.25x
  });

  it("flags Healthy above the warning band", () => {
    expect(riskLevel(25000, 2000, 16000)).toBe("healthy"); // Crown Cap
  });

  it("treats zero demand as Healthy regardless of stock level", () => {
    // Reorder math alone would say critical (10 ≤ 50), but no demand → no risk.
    expect(riskLevel(10, 0, 50)).toBe("healthy");
  });
});

describe("analyzeInput", () => {
  it("computes every metric for a Critical SKU (Corrugated Carton)", () => {
    const m = analyzeInput({
      sku: "Corrugated Carton - Large",
      currentStock: 300,
      avgDailyDemand: 45,
      maxDailyDemand: 90,
      leadTimeDays: 14,
      unitCost: 120,
    });
    expect(m.safetyStock).toBe(630);
    expect(m.reorderPoint).toBe(1260);
    expect(m.warningThreshold).toBe(1575);
    expect(m.daysOfSupply).toBeCloseTo(6.6667, 3);
    expect(m.inventoryValue).toBe(36000);
    expect(m.risk).toBe("critical");
  });

  it("leaves inventoryValue null when unit cost is absent", () => {
    const m = analyzeInput({
      sku: "No Cost SKU",
      currentStock: 500,
      avgDailyDemand: 50,
      maxDailyDemand: 80,
      leadTimeDays: 10,
    });
    expect(m.inventoryValue).toBeNull();
  });

  it("returns N/A days of supply and Healthy risk for zero demand", () => {
    const m = analyzeInput({
      sku: "Dormant SKU",
      currentStock: 10,
      avgDailyDemand: 0,
      maxDailyDemand: 10,
      leadTimeDays: 5,
    });
    expect(m.daysOfSupply).toBeNull();
    expect(m.risk).toBe("healthy");
  });
});

describe("summarize", () => {
  const rows: SkuMetrics[] = [
    analyzeInput({ sku: "A", currentStock: 300, avgDailyDemand: 45, maxDailyDemand: 90, leadTimeDays: 14, unitCost: 120 }), // critical
    analyzeInput({ sku: "B", currentStock: 12000, avgDailyDemand: 800, maxDailyDemand: 1400, leadTimeDays: 7, unitCost: 8 }), // warning
    analyzeInput({ sku: "C", currentStock: 25000, avgDailyDemand: 2000, maxDailyDemand: 3200, leadTimeDays: 5, unitCost: 1 }), // healthy
  ];

  it("counts risk bands and sums at-risk SKUs", () => {
    const s = summarize(rows);
    expect(s.totalSkus).toBe(3);
    expect(s.criticalCount).toBe(1);
    expect(s.warningCount).toBe(1);
    expect(s.healthyCount).toBe(1);
    expect(s.atRiskSkus).toBe(2);
  });

  it("sums inventory value across valued rows", () => {
    // 36000 + 96000 + 25000 = 157000
    expect(summarize(rows).totalInventoryValue).toBe(157000);
  });

  it("returns null inventory value when no row carries a cost", () => {
    const noCost = [
      analyzeInput({ sku: "X", currentStock: 500, avgDailyDemand: 50, maxDailyDemand: 80, leadTimeDays: 10 }),
    ];
    expect(summarize(noCost).totalInventoryValue).toBeNull();
  });
});
