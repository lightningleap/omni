import React from "react";

export function StatusBadge({ status }: { status: string }) {
  const norm = status.toUpperCase();
  let colors = "bg-neutral-100 text-neutral-600 border-neutral-200";

  switch (norm) {
    case "PAID":
    case "DELIVERED":
      colors = "bg-emerald-50 text-emerald-700 border-emerald-100 font-bold";
      break;
    case "PROCESSING":
      colors = "bg-sky-50 text-sky-700 border-sky-100 font-bold";
      break;
    case "SHIPPED":
      colors = "bg-indigo-50 text-indigo-700 border-indigo-100 font-bold";
      break;
    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
      colors = "bg-amber-50 text-amber-700 border-amber-100 font-bold";
      break;
    case "CANCELLED":
    case "FAILED":
    case "PAYMENT_FAILED":
    case "DISPUTED":
    case "MANUAL_INTERVENTION_REQUIRED":
      colors = "bg-rose-50 text-rose-700 border-rose-100 font-bold";
      break;
  }

  const label =
    norm === "MANUAL_INTERVENTION_REQUIRED"
      ? "INTERVENTION REQ"
      : norm.replace(/_/g, " ");

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide border ${colors}`}>
      {label}
    </span>
  );
}
