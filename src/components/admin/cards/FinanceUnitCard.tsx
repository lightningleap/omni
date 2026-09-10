"use client";

import React from "react";
import Image from "next/image";
import { ADMIN_RULE } from "@/components/admin/ui/primitives";
import { MarginBadge } from "@/components/admin/MarginBadge";

/**
 * One product's unit economics, in the card view.
 *
 * ── WHY THIS IS NOT A CUSTOMER CARD ─────────────────────────────────────────
 * A customer card leads with a person. This leads with a number. The Finance
 * table is sorted by yield descending, so the card grid is a ranked league
 * table of what each product has actually earned — and the card is built to be
 * read down that ranking: identity and margin band on one line, the yield as
 * the anchor, then the three figures that explain how the yield was reached.
 *
 * ── WHAT "STATUS" MEANS ON A FINANCE CARD ───────────────────────────────────
 * The margin band, via the same `MarginBadge` the table cell renders. The unit
 * object does carry a `status` of ACTIVE/DRAFT, but that is derived from
 * whether the product sits in a collection — a catalogue state, not a
 * financial one, which is why the Finance table has never shown it. Putting it
 * on a finance card would be importing a different section's meaning.
 *
 * ── NOTHING HERE IS INVENTED ────────────────────────────────────────────────
 * price, cost, marginPercent, unitsSold, totalProfitGenerated, name, imageUrl —
 * the whole unit object. Profit per unit is `price - cost`, which is the
 * arithmetic the table cell already does. There is no growth figure, no
 * period-over-period delta and no per-product chart, because Finance holds no
 * such data for a single product.
 *
 * ── AND NO ACTION, BECAUSE THERE IS NO ACTION ───────────────────────────────
 * Finance's rows are not clickable and have no per-row control; the section's
 * one action is "Download report", which is page-level and stays in the page
 * header where it already lives. So this card is a plate of data, not a
 * button. Inventing a "View product" link here would be inventing navigation
 * the list view does not offer.
 */

type UnitData = {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  cost: number;
  marginPercent: number;
  unitsSold: number;
  totalProfitGenerated: number;
  status: string;
  isAssigned: boolean;
};

/**
 * The studio's money format. Exported because `FinanceClient` formats the same
 * values for its KPI tiles, its table and its CSV export — one definition, so a
 * figure cannot be punctuated one way in a row and another in a card.
 */
export const formatUSD = (val: number) =>
  `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Label / figure, right-aligned, for the breakdown under the yield. */
function Line({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="type-admin-meta shrink-0 text-neutral-500">{label}</dt>
      <dd
        className={`type-admin-body truncate tabular-nums ${
          strong ? "font-semibold text-ink" : "text-neutral-600"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export default function FinanceUnitCard({ item }: { item: UnitData }) {
  const profitPerUnit = item.price - item.cost;

  return (
    <article
      style={{ borderColor: ADMIN_RULE }}
      className="flex flex-col gap-3.5 rounded-panel border bg-white p-4 transition-colors duration-200 hover:border-neutral-300"
    >
      {/* ── TOP: which product, and how healthy its margin is ────────────
          Same 40px thumbnail well as the table cell, so a product looks the
          same in both views. `alt=""` because the name is right beside it. */}
      <div className="flex items-start gap-3">
        <div
          style={{ borderColor: ADMIN_RULE }}
          className="relative h-10 w-10 shrink-0 overflow-hidden rounded-card border bg-[#FBFAF8]"
        >
          {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="40px" className="object-cover" />}
        </div>

        <p
          className="type-admin-body line-clamp-2 min-h-[2.6em] min-w-0 flex-1 font-semibold text-ink"
          title={item.name}
        >
          {item.name}
        </p>

        <MarginBadge marginPercent={item.marginPercent} srLabel="Margin" className="shrink-0" />
      </div>

      {/* ── THE ANCHOR: what this product has actually earned ────────────
          The stat step — 18px semibold and tabular. That is the studio's
          figure size, the one the KPI tiles use, and it was tuned down to it
          precisely so a total on a card the size of a postcard reads as a
          number to be read rather than a dashboard headline. */}
      <div>
        <p className="type-admin-label text-neutral-400">Total yield</p>
        <p className="type-admin-stat mt-1 truncate text-ink" title={formatUSD(item.totalProfitGenerated)}>
          {formatUSD(item.totalProfitGenerated)}
        </p>
        <p className="type-admin-meta mt-1 text-neutral-500">
          {item.unitsSold === 0
            ? "No units sold yet"
            : `From ${item.unitsSold.toLocaleString("en-US")} ${item.unitsSold === 1 ? "unit" : "units"} sold`}
        </p>
      </div>

      {/* ── HOW IT GETS THERE ────────────────────────────────────────────
          Retail less base cost is profit per unit; profit per unit times units
          sold is the yield above. Stacked label/figure rows rather than three
          columns, because "Profit / unit" set in the 11px label caps does not
          fit a third of a card without breaking across two lines. */}
      <dl
        style={{ borderColor: ADMIN_RULE }}
        className="mt-auto space-y-1.5 border-t pt-3"
      >
        <Line label="Retail" value={formatUSD(item.price)} />
        <Line label="Base cost" value={formatUSD(item.cost)} />
        <Line label="Profit / unit" value={formatUSD(profitPerUnit)} strong />
      </dl>
    </article>
  );
}
