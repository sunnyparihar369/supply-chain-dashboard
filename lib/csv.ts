// CSV ingestion: flexible header matching, per-row validation, and analysis.
// Parsing runs entirely client-side via papaparse — no backend, no upload.

import Papa from "papaparse";
import type { AnalysisResult, InvalidRow, InventoryInput } from "./types";
import { analyzeInput, summarize } from "./calculations";

/** Canonical field → accepted header variants (matched case/space-insensitively). */
const HEADER_ALIASES: Record<keyof InventoryInput, string[]> = {
  sku: ["sku", "product", "product name", "item", "material", "name"],
  currentStock: ["current stock", "stock", "on hand", "quantity", "qty", "units"],
  avgDailyDemand: [
    "avg daily demand",
    "average daily demand",
    "daily demand",
    "average demand",
    "avg demand",
  ],
  maxDailyDemand: [
    "max daily demand",
    "maximum daily demand",
    "peak daily demand",
    "max demand",
    "peak demand",
  ],
  leadTimeDays: ["lead time days", "lead time", "lead time in days", "leadtime"],
  unitCost: ["unit cost", "cost", "price", "unit price", "cost per unit"],
};

const REQUIRED_FIELDS: (keyof InventoryInput)[] = [
  "sku",
  "currentStock",
  "avgDailyDemand",
  "maxDailyDemand",
  "leadTimeDays",
];

/** Normalize a header for tolerant matching: lowercase, strip punctuation. */
function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .replace(/[_\-/()]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Human-readable labels for validation messages. */
const FIELD_LABELS: Record<keyof InventoryInput, string> = {
  sku: "SKU",
  currentStock: "current_stock",
  avgDailyDemand: "avg_daily_demand",
  maxDailyDemand: "max_daily_demand",
  leadTimeDays: "lead_time_days",
  unitCost: "unit_cost",
};

type HeaderMap = Partial<Record<keyof InventoryInput, string>>;

/** Resolve the file's actual headers to our canonical fields. */
function mapHeaders(headers: string[]): {
  map: HeaderMap;
  missingRequired: string[];
} {
  const normalized = headers.map((h) => ({ raw: h, norm: normalizeHeader(h) }));
  const map: HeaderMap = {};

  (Object.keys(HEADER_ALIASES) as (keyof InventoryInput)[]).forEach((field) => {
    const aliases = HEADER_ALIASES[field];
    const hit = normalized.find((h) => aliases.includes(h.norm));
    if (hit) map[field] = hit.raw;
  });

  const missingRequired = REQUIRED_FIELDS.filter((f) => !map[f]).map(
    (f) => FIELD_LABELS[f],
  );

  return { map, missingRequired };
}

/** Parse a cell to a non-negative finite number, or return an error message. */
function parseNumeric(
  raw: string | undefined,
  label: string,
  { required }: { required: boolean },
): { value?: number; issue?: string } {
  const trimmed = (raw ?? "").trim();
  if (trimmed === "") {
    return required ? { issue: `Missing ${label}` } : {};
  }
  // Tolerate thousands separators and currency symbols in the source data.
  const cleaned = trimmed.replace(/[$,\s]/g, "");
  const num = Number(cleaned);
  if (!Number.isFinite(num)) return { issue: `${label} is not a number` };
  if (num < 0) return { issue: `${label} cannot be negative` };
  return { value: num };
}

/** Validate raw string rows into typed inputs, collecting invalid rows. */
export function validateRows(
  rawRows: Record<string, string>[],
  map: HeaderMap,
): { inputs: InventoryInput[]; invalid: InvalidRow[] } {
  const inputs: InventoryInput[] = [];
  const invalid: InvalidRow[] = [];

  rawRows.forEach((row, index) => {
    const issues: string[] = [];
    const skuRaw = (map.sku ? row[map.sku] : "")?.trim() ?? "";
    if (skuRaw === "") issues.push("Missing SKU");

    const numericFields: (keyof InventoryInput)[] = [
      "currentStock",
      "avgDailyDemand",
      "maxDailyDemand",
      "leadTimeDays",
    ];
    const parsed: Partial<Record<keyof InventoryInput, number>> = {};

    numericFields.forEach((field) => {
      const header = map[field];
      const { value, issue } = parseNumeric(
        header ? row[header] : undefined,
        FIELD_LABELS[field],
        { required: true },
      );
      if (issue) issues.push(issue);
      else if (value !== undefined) parsed[field] = value;
    });

    const costHeader = map.unitCost;
    const { value: unitCost, issue: costIssue } = parseNumeric(
      costHeader ? row[costHeader] : undefined,
      FIELD_LABELS.unitCost,
      { required: false },
    );
    if (costIssue) issues.push(costIssue);

    if (issues.length > 0) {
      invalid.push({
        rowNumber: index + 1,
        sku: skuRaw || `Row ${index + 1}`,
        issues,
        raw: row,
      });
      return;
    }

    inputs.push({
      sku: skuRaw,
      currentStock: parsed.currentStock!,
      avgDailyDemand: parsed.avgDailyDemand!,
      maxDailyDemand: parsed.maxDailyDemand!,
      leadTimeDays: parsed.leadTimeDays!,
      unitCost,
    });
  });

  return { inputs, invalid };
}

/** Turn validated inputs into the full analysis (metrics + summary). */
export function analyze(inputs: InventoryInput[], invalid: InvalidRow[]): AnalysisResult {
  const rows = inputs.map(analyzeInput);
  return { rows, invalid, summary: summarize(rows) };
}

/** Result of ingesting a file — either a header error or a full analysis. */
export type ParseOutcome =
  | { ok: false; missingColumns: string[]; foundColumns: string[] }
  | { ok: true; result: AnalysisResult };

/** Parse + validate + analyze a CSV File, all in the browser. */
export function parseCsvFile(file: File): Promise<ParseOutcome> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (results) => {
        const headers = results.meta.fields ?? [];
        const { map, missingRequired } = mapHeaders(headers);
        if (missingRequired.length > 0) {
          resolve({
            ok: false,
            missingColumns: missingRequired,
            foundColumns: headers,
          });
          return;
        }
        const { inputs, invalid } = validateRows(results.data, map);
        resolve({ ok: true, result: analyze(inputs, invalid) });
      },
      error: (err) => reject(err),
    });
  });
}
