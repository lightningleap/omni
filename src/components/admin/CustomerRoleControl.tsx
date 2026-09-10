"use client";

import React from "react";
import { Lock } from "lucide-react";
import { Role } from "@prisma/client";

/**
 * A customer's role, as an editable control — or as a locked pill when it is
 * not this screen's to change.
 *
 * ── WHY IT IS A COMPONENT AND NOT MARKUP IN TWO PLACES ──────────────────────
 * The Customers section now renders in two views, and the role is the one
 * piece of the row that is not a value but a CONTROL: a `<select>` wired to a
 * server action, with two states in which it must refuse to be one — a
 * `pinned` account from ADMIN_EMAILS, and the signed-in admin's own account.
 *
 * Copied into a card, that logic would be a second place for the lock rule to
 * be wrong. This is the same relationship `StatusBadge` has with the Orders
 * table and `OrderCard`: one component decides, both views render it, and a
 * card can never disagree with a row about who may be demoted.
 *
 * The markup is the table cell's, unchanged — the list view looks exactly as
 * it did, because it is still rendering exactly what it rendered before.
 */

export type CustomerRoleTarget = {
  name: string | null;
  email: string;
  role: Role;
  /** Pinned as an admin by ADMIN_EMAILS — cannot be changed from here. */
  pinned: boolean;
  /** The signed-in admin's own row — cannot demote themselves. */
  isSelf: boolean;
};

export function CustomerRoleControl({
  customer,
  saving,
  onChange,
  className = "",
}: {
  customer: CustomerRoleTarget;
  saving: boolean;
  onChange: (role: Role) => void;
  className?: string;
}) {
  if (customer.pinned || customer.isSelf) {
    return (
      <span
        title={
          customer.pinned
            ? "Pinned as an admin in ADMIN_EMAILS — change it there"
            : "You cannot change your own role"
        }
        className={`type-admin-label inline-flex items-center gap-1 rounded-card border border-[#E7D3CB] bg-[#FBF3F0] px-2 py-1 text-brand-terracotta ${className}`}
      >
        <Lock aria-hidden className="h-2.5 w-2.5" />
        {customer.role}
      </span>
    );
  }

  return (
    <select
      value={customer.role}
      disabled={saving}
      aria-label={`Role for ${customer.name || customer.email}`}
      /* The table row is clickable and opens the drawer; without this, changing
         a role would open a drawer on top of the change. Harmless in the card
         view, where nothing above the control listens for a click. */
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value as Role)}
      className={`type-admin-meta cursor-pointer rounded-card border px-2 py-1 font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-700/30 disabled:opacity-50 ${
        customer.role === "ADMIN"
          ? "border-[#E7D3CB] bg-[#FBF3F0] text-brand-terracotta"
          : customer.role === "VIP"
            ? "border-[#FBE9B3] bg-[#FFF5D1] text-[#4F4700]"
            : "border-[#E8E6E1] bg-white text-neutral-500"
      } ${className}`}
    >
      <option value="CUSTOMER">Customer</option>
      <option value="VIP">VIP</option>
      <option value="ADMIN">Admin</option>
    </select>
  );
}
