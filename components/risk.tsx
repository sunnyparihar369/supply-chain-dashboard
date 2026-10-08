import type { RiskLevel } from "@/lib/types";
import { CriticalIcon, HealthyIcon, WarningIcon } from "./icons";

// Single source of truth for how each risk band presents. Status color is
// always paired with an icon and a text label — never carried by hue alone.
export const RISK_META: Record<
  RiskLevel,
  {
    label: string;
    /** CSS color for the accent (border, dot, icon). */
    color: string;
    /** Very light tinted fill for badges / row accents. */
    tint: string;
    /** Readable text color on the tint. */
    text: string;
    Icon: typeof CriticalIcon;
    action: string;
  }
> = {
  critical: {
    label: "Critical",
    color: "var(--color-critical)",
    tint: "rgba(208, 59, 59, 0.10)",
    text: "#a52a2a",
    Icon: CriticalIcon,
    action: "Reorder now",
  },
  warning: {
    label: "Warning",
    color: "var(--color-warning)",
    tint: "rgba(224, 150, 27, 0.13)",
    text: "#96650d",
    Icon: WarningIcon,
    action: "Approaching reorder point",
  },
  healthy: {
    label: "Healthy",
    color: "var(--color-good)",
    tint: "rgba(12, 163, 12, 0.10)",
    text: "#0a7d0a",
    Icon: HealthyIcon,
    action: "Stock level OK",
  },
};

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const { label, tint, text, Icon } = RISK_META[risk];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: tint, color: text }}
    >
      <Icon width={13} height={13} aria-hidden />
      {label}
    </span>
  );
}
