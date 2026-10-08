// Inline SVG icons — no icon dependency, consistent 1.75px strokes.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function UploadIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4v12M7 11l5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function CriticalIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5M12 16h.01" />
    </svg>
  );
}

export function WarningIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

export function HealthyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </svg>
  );
}

export function BoxesIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.3 7 12 11l8.7-4M12 11v9" />
      <path d="M12 2 3.3 6v8L12 18l8.7-4V6L12 2Z" />
    </svg>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  );
}

export function ValueIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.2A2 2 0 0 1 12 8.5c1.2 0 2 .7 2 1.6 0 2.3-4 1.4-4 3.6 0 .9.9 1.6 2 1.6a2 2 0 0 0 2.5-.7" />
    </svg>
  );
}

export function SortIcon({ dir, ...props }: IconProps & { dir?: "asc" | "desc" | null }) {
  return (
    <svg {...base} width={13} height={13} {...props}>
      <path
        d="M8 4.5 5.5 8h5L8 4.5Z"
        fill={dir === "asc" ? "currentColor" : "none"}
        stroke="none"
      />
      <path
        d="M8 15.5 5.5 12h5L8 15.5Z"
        fill={dir === "desc" ? "currentColor" : "none"}
        stroke="none"
      />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function FileIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}
