"use client";

import { useRef, useState } from "react";
import { DownloadIcon, FileIcon, UploadIcon } from "./icons";

export type UploadError = {
  message: string;
  missingColumns?: string[];
  foundColumns?: string[];
};

const STEPS = [
  {
    n: "1",
    title: "Upload your CSV",
    body: "SKU, current stock, average & max daily demand, lead time, and optional unit cost.",
  },
  {
    n: "2",
    title: "We run the math",
    body: "Safety stock, reorder point, and days of supply are computed for every SKU.",
  },
  {
    n: "3",
    title: "See what's at risk",
    body: "SKUs are ranked and color-coded so you know what to reorder first.",
  },
];

export function EmptyState({
  onFile,
  onSample,
  error,
  loading,
}: {
  onFile: (file: File) => void;
  onSample: () => void;
  error: UploadError | null;
  loading: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFile(file);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`rise flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
          dragging
            ? "border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_6%,var(--color-surface))]"
            : "border-[var(--color-hairline-strong)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]"
        }`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-accent)_10%,var(--color-surface))] text-[var(--color-accent)]">
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
          ) : (
            <UploadIcon width={24} height={24} />
          )}
        </div>
        <p className="mt-4 text-base font-semibold text-[var(--color-ink)]">
          {loading ? "Analyzing…" : "Drop your inventory CSV here"}
        </p>
        <p className="mt-1 text-sm text-[var(--color-ink-2)]">
          or <span className="font-semibold text-[var(--color-accent)]">browse to upload</span>
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-[color-mix(in_srgb,var(--color-critical)_35%,var(--color-hairline))] bg-[color-mix(in_srgb,var(--color-critical)_7%,var(--color-surface))] p-4 text-sm"
        >
          <p className="font-semibold text-[var(--color-critical)]">{error.message}</p>
          {error.missingColumns && error.missingColumns.length > 0 && (
            <p className="mt-1 text-[var(--color-ink-2)]">
              Missing required columns:{" "}
              <span className="font-mono font-semibold">
                {error.missingColumns.join(", ")}
              </span>
            </p>
          )}
          {error.foundColumns && error.foundColumns.length > 0 && (
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Found: {error.foundColumns.join(", ")}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <button
          type="button"
          onClick={onSample}
          disabled={loading}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)] hover:underline disabled:opacity-50"
        >
          <FileIcon width={16} height={16} />
          Try it with sample data
        </button>
        <span className="hidden text-[var(--color-hairline-strong)] sm:inline">·</span>
        <a
          href="/sample-inventory.csv"
          download
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:underline"
        >
          <DownloadIcon width={16} height={16} />
          Download sample CSV
        </a>
      </div>

      {/* How it works */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div
            key={step.n}
            className="rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-4"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-ink)] text-xs font-bold text-white">
                {step.n}
              </span>
              <FileIcon width={15} height={15} className="text-[var(--color-muted)]" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-[var(--color-ink)]">
              {step.title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-ink-2)]">
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
