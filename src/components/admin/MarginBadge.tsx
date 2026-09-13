import React from "react";

/**
 * A product's gross margin, as a compact badge.
 *
 * ── THIS IS FINANCE'S EXISTING STATUS LOGIC, NOT A NEW ONE ──────────────────
 * The unit-economics table already banded margin into three tones — the accent
 * above 60%, the brand terracotta below 40%, warm neutral in between. Those
 * thresholds and those colours are lifted here verbatim; nothing is retuned.
 *
 * It became a component when Finance gained a card view, for the reason
 * `StatusBadge` is one: two views painting the same band from two copies of
 * the same three-way conditional is two places for it to drift. The table cell
 * renders this now and looks exactly as it did.
 *
 * ── COLOUR IS NEVER THE ONLY SIGNAL ─────────────────────────────────────────
 * The badge prints the percentage itself, so the band is legible without
 * colour vision — the tone only makes a long list faster to scan. `srLabel`
 * names the figure for assistive tech where no column header does; the table
 * has a "Margin" header and so passes none.
 */
export function MarginBadge({
  marginPercent,
  srLabel,
  className = "",
}: {
  marginPercent: number;
  /** Visually hidden prefix, for contexts with no column header. */
  srLabel?: string;
  className?: string;
}) {
  const isLowMargin = marginPercent < 40;
  const isHighMargin = marginPercent > 60;

  return (
    <span
      className={`type-admin-meta inline-flex items-center rounded-card border px-2 py-0.5 font-semibold tabular-nums ${
        isHighMargin
          ? "border-accent-200 bg-accent-50 text-accent-800"
          : isLowMargin
            ? "border-[#E7D3CB] bg-[#FBF3F0] text-brand-terracotta"
            : "border-[#E8E6E1] bg-[#FBFAF8] text-neutral-500"
      } ${className}`}
    >
      {srLabel && <span className="sr-only">{srLabel} </span>}
      {marginPercent.toFixed(1)}%
    </span>
  );
}
