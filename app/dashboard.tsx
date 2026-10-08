"use client";

import { useMemo, useState } from "react";
import type { AnalysisResult, RiskLevel } from "@/lib/types";
import { parseCsvFile } from "@/lib/csv";
import { EmptyState, type UploadError } from "@/components/EmptyState";
import { FilterBar } from "@/components/FilterBar";
import { SummaryCards } from "@/components/SummaryCards";
import { RiskDistribution } from "@/components/RiskDistribution";
import { InventoryTable } from "@/components/InventoryTable";
import { DataIssues } from "@/components/DataIssues";

type RiskFilter = RiskLevel | "all";

export function Dashboard() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UploadError | null>(null);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");

  async function ingest(file: File) {
    setLoading(true);
    setError(null);
    try {
      const outcome = await parseCsvFile(file);
      if (!outcome.ok) {
        setError({
          message: "We couldn't find all the required columns in that file.",
          missingColumns: outcome.missingColumns,
          foundColumns: outcome.foundColumns,
        });
        return;
      }
      if (outcome.result.rows.length === 0) {
        setError({
          message:
            outcome.result.invalid.length > 0
              ? "No valid rows to analyze — every row had a data issue."
              : "That file didn't contain any rows.",
        });
        return;
      }
      setResult(outcome.result);
      setSearch("");
      setRiskFilter("all");
    } catch {
      setError({ message: "Something went wrong reading that file. Is it a valid CSV?" });
    } finally {
      setLoading(false);
    }
  }

  async function loadSample() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/sample-inventory.csv");
      const text = await res.text();
      const file = new File([text], "sample-inventory.csv", { type: "text/csv" });
      await ingest(file);
    } catch {
      setError({ message: "Couldn't load the sample file. Try uploading your own CSV." });
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setSearch("");
    setRiskFilter("all");
  }

  const filteredRows = useMemo(() => {
    if (!result) return [];
    const q = search.trim().toLowerCase();
    return result.rows.filter((row) => {
      if (riskFilter !== "all" && row.risk !== riskFilter) return false;
      if (q && !row.sku.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [result, search, riskFilter]);

  return (
    <div className="min-h-full bg-[var(--color-plane)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-3xl">
            Supply Chain Risk &amp; Reorder Dashboard
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-2)]">
            Upload an inventory snapshot to compute safety stock, reorder points,
            and days of supply — then see which SKUs to reorder first.
          </p>
        </header>

        {!result ? (
          <EmptyState onFile={ingest} onSample={loadSample} error={error} loading={loading} />
        ) : (
          <div className="space-y-6">
            <SummaryCards summary={result.summary} />

            <RiskDistribution
              summary={result.summary}
              active={riskFilter}
              onSelect={(risk) =>
                setRiskFilter((cur) => (cur === risk ? "all" : risk))
              }
            />

            <FilterBar
              search={search}
              onSearch={setSearch}
              riskFilter={riskFilter}
              onRiskFilter={setRiskFilter}
              onReset={reset}
              resultCount={filteredRows.length}
              totalCount={result.rows.length}
            />

            <InventoryTable rows={filteredRows} />

            <DataIssues rows={result.invalid} />
          </div>
        )}
      </div>
    </div>
  );
}
