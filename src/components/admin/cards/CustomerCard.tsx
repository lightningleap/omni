"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { Role } from "@prisma/client";
import { AdminButton, ADMIN_RULE } from "@/components/admin/ui/primitives";
import { CustomerRoleControl } from "@/components/admin/CustomerRoleControl";
import { AdminCheckbox } from "@/components/admin/ui/checkbox";

/**
 * A customer in the card view.
 *
 * ── WHY THIS IS NOT AN ORDER CARD ───────────────────────────────────────────
 * An order card answers "which one, what state, how much". A customer card
 * answers "WHO is this, and are they worth anything to us" — so it leads with
 * identity rather than an identifier. The monogram and the name take the top
 * of the card, the email sits under the name as the thing an admin actually
 * copies, and the two numbers that say what the relationship is worth get a
 * tile of their own rather than being another line of text.
 *
 * ── EVERY FIELD HERE IS A FIELD THE TABLE ALREADY HAS ───────────────────────
 * name, email, role, ordersCount, totalSpent. That is the whole customer
 * object. There is no avatar image on a user in this schema, no signup date on
 * the client boundary and no last-order date, so the card has none of those —
 * a "Last order —" line would be a placeholder pretending to be data.
 *
 * The monogram is not an exception to that: it is the customer's own name (or
 * their email when they have no name) rendered as two letters. It carries no
 * information the card is not already printing in full underneath it; it is
 * there to give a grid of cards distinct, human anchors to scan down.
 *
 * ── THE CARD IS NOT ONE BIG BUTTON ──────────────────────────────────────────
 * OrderCard can be, because an order card holds no controls. This one holds
 * two — a selection checkbox and the role `<select>` — and neither a checkbox
 * nor a select is valid inside a `<button>`. So the card is an `<article>`
 * with one real button in it, "View customer", which does exactly what
 * clicking the table row does. Nothing here depends on click propagation.
 */

type CustomerData = {
  id: string;
  name: string | null;
  email: string;
  totalSpent: number;
  ordersCount: number;
  role: Role;
  pinned: boolean;
  isSelf: boolean;
};

/**
 * Up to two initials, from the name if there is one and the email if not.
 * Guests have neither a name nor a useful one, hence the fallback chain.
 */
function initialsOf(customer: CustomerData): string {
  const source = customer.name?.trim() || customer.email.trim();
  const letters = source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return letters.toUpperCase() || "?";
}

export default function CustomerCard({
  customer,
  isSelected,
  onToggleSelect,
  onOpen,
  saving,
  onChangeRole,
}: {
  customer: CustomerData;
  isSelected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  saving: boolean;
  onChangeRole: (role: Role) => void;
}) {
  const displayName = customer.name || "Guest customer";

  return (
    <article
      style={{ borderColor: isSelected ? undefined : ADMIN_RULE }}
      className={`group flex flex-col gap-3.5 rounded-panel border bg-white p-4 transition-colors duration-200 ${
        isSelected ? "border-accent-800 bg-accent-50/30" : "hover:border-neutral-300"
      }`}
    >
      {/* ── TOP: who, and the selection checkbox ─────────────────────────
          The monogram is decorative — the name it is built from is the very
          next thing in the reading order — so it is hidden from assistive
          tech rather than announced twice. */}
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="type-admin-body flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent-200 bg-accent-50 font-semibold text-accent-800"
        >
          {initialsOf(customer)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="type-admin-body truncate font-semibold text-ink" title={displayName}>
            {displayName}
          </p>
          <p className="type-admin-meta truncate text-neutral-500" title={customer.email}>
            {customer.email}
          </p>
        </div>

        <AdminCheckbox
          className="mt-0.5"
          checked={isSelected}
          onChange={onToggleSelect}
          label={`Select ${displayName}`}
        />
      </div>

      {/* ── ROLE: the same control the table cell renders ────────────────
          Its own line rather than crowded into the header, because on an
          account that is not pinned this is a `<select>` and a select wedged
          between a truncating email and a checkbox is a control nobody can
          hit. */}
      <div className="flex items-center">
        <CustomerRoleControl customer={customer} saving={saving} onChange={onChangeRole} />
      </div>

      {/* ── THE TWO NUMBERS THAT MATTER ──────────────────────────────────
          The table's last two columns, given the room a table cannot spare.
          Recessed onto the studio's off-white so the figures read as a block
          of data rather than as two more lines of the card. */}
      <div
        style={{ borderColor: ADMIN_RULE }}
        className="grid grid-cols-2 gap-3 rounded-card border bg-[#FBFAF8] px-3 py-2.5"
      >
        <div className="min-w-0">
          <p className="type-admin-label text-neutral-400">Orders</p>
          <p className="type-admin-stat mt-1 text-ink">{customer.ordersCount}</p>
        </div>
        <div className="min-w-0">
          <p className="type-admin-label text-neutral-400">Lifetime value</p>
          {/* Formatted exactly as the table cell formats it, so the same
              customer never shows two different totals in two views. */}
          <p className="type-admin-stat mt-1 truncate text-ink">
            $
            {customer.totalSpent.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* ── THE ACTION: the row click, made explicit ─────────────────────── */}
      <AdminButton className="mt-auto w-full" onClick={onOpen}>
        View customer
        <ArrowRight
          aria-hidden
          size={13}
          strokeWidth={2}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </AdminButton>
    </article>
  );
}
