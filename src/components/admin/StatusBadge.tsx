import React from "react";

/**
 * An order status, as a compact badge.
 *
 * ── THE VALUES ARE UNTOUCHED ────────────────────────────────────────────────
 * Every case below is a real `OrderStatus` from `prisma/schema.prisma`, and the
 * labels are the enum values with underscores replaced. Nothing here renames,
 * merges or invents a status — this file decides colour and nothing else.
 *
 * ── WHY THE BLUE IS GONE ────────────────────────────────────────────────────
 * PROCESSING used to render `bg-sky-50 text-sky-700` — a stock dashboard blue
 * that appears nowhere else in this project and read as a template default
 * sitting in the middle of the brand's greens and warm neutrals.
 *
 * Four tones now, drawn from the palette the storefront already ships:
 *
 *   good     the accent          PAID · DELIVERED · SHIPPED
 *   active   warm neutral ink    PROCESSING · PENDING and anything unmapped
 *   caution  the brand amber     REFUNDED · PARTIALLY_REFUNDED
 *   fault    brand terracotta    CANCELLED · FAILED · DISPUTED · INTERVENTION
 *
 * Colour never carries the meaning alone: every badge prints its own label, so
 * the tone only makes a long list faster to scan.
 *
 * ── SIZE ────────────────────────────────────────────────────────────────────
 * 10px, `rounded-card` rather than a full pill. In a dense table a pill reads
 * as a button and invites a click the badge does not handle.
 */
export function StatusBadge({ status }: { status: string }) {
  const norm = status.toUpperCase();

  // Warm neutral is the default, so an unmapped status is quiet rather than
  // loud — a new enum value should never arrive on screen painted as an error.
  let colors = "bg-[#F4F2ED] text-neutral-600 border-[#E8E6E1]";

  switch (norm) {
    case "PAID":
    case "DELIVERED":
    case "SHIPPED":
      colors = "bg-accent-50 text-accent-800 border-accent-200";
      break;
    case "PROCESSING":
    case "PENDING":
      colors = "bg-[#F4F2ED] text-neutral-700 border-[#DCD9D2]";
      break;
    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
      colors = "bg-[#FBF4E9] text-[#8A6A3A] border-[#EFE2CC]";
      break;
    case "CANCELLED":
    case "FAILED":
    case "PAYMENT_FAILED":
    case "DISPUTED":
    case "MANUAL_INTERVENTION_REQUIRED":
      colors = "bg-[#FBF3F0] text-brand-terracotta border-[#E7D3CB]";
      break;
  }

  const label =
    norm === "MANUAL_INTERVENTION_REQUIRED"
      ? "INTERVENTION REQ"
      : norm.replace(/_/g, " ");

  return (
    <span
      className={`type-admin-label inline-flex items-center whitespace-nowrap rounded-card border px-2 py-1 ${colors}`}
    >
      {label}
    </span>
  );
}
