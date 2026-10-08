"use client";

import type { RiskLevel } from "@/lib/types";
import { RISK_META } from "./risk";
import { SearchIcon, UploadIcon } from "./icons";

type Filter = RiskLevel | "all";
const OPTIONS: Filter[] = ["all", "critical", "warning", "healthy"];

export function FilterBar({
  search,
  onSearch,
  riskFilter,
  onRiskFilter,
  onReset,
  resultCount,
  totalCount,
}: {
  search: string;
  onSearch: (v: string) => void;
  riskFilter: Filter;
  onRiskFilter: (v: Filter) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search by SKU */}
        <div className="relative sm:max-w-xs sm:flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search SKU…"
            className="w-full rounded-lg border border-[var(--color-hairline)] bg-[var(--color-surface)] py-2 pl-9 pr-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>

        {/* Risk filter — segmented control */}
        <div className="inline-flex rounded-lg border border-[var(--color-hairline)] bg-[var(--color-surface)] p-0.5">
          {OPTIONS.map((opt) => {
            const isActive = riskFilter === opt;
            const label = opt === "all" ? "All" : RISK_META[opt].label;
            const color = opt === "all" ? undefined : RISK_META[opt].color;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onRiskFilter(opt)}
                aria-pressed={isActive}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-[var(--color-ink)] text-white"
                    : "text-[var(--color-ink-2)] hover:bg-[var(--color-surface-2)]"
                }`}
              >
                {color && (
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                )}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-[var(--color-muted)]">
          Showing <span className="tnum font-semibold text-[var(--color-ink-2)]">{resultCount}</span> of {totalCount}
        </span>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-ink-2)] transition-colors hover:border-[var(--color-hairline-strong)] hover:text-[var(--color-ink)]"
        >
          <UploadIcon width={14} height={14} />
          Upload new file
        </button>
      </div>
    </div>
  );
}
