"use client";

import React from 'react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ADMIN_RULE, AdminMono } from '@/components/admin/ui/primitives';
import { AdminCheckbox } from '@/components/admin/ui/checkbox';

/**
 * An order in the card view.
 *
 * ── WHY THIS IS NOT A PRODUCT CARD ──────────────────────────────────────────
 * An order has no photograph and nothing to admire; it is four facts someone
 * needs to read at a glance — WHICH order, WHAT state, WHO placed it, HOW
 * MUCH. So there is no image well, and the card is typography on a plate.
 *
 * The layout follows that reading order. The id and the status badge take the
 * top line together, because "#a3f9c, cancelled" is the sentence the reader is
 * actually scanning for. The total sits on the bottom line opposite the date,
 * one step up from everything around it — enough to find at a glance, not so
 * much that a postcard-sized card has a headline on it.
 *
 * ── STATUS COLOUR IS NOT RE-DECIDED HERE ────────────────────────────────────
 * It renders `StatusBadge`, the same component the table cell renders. Every
 * state's colour therefore comes from one place, and a card can never disagree
 * with a row about what "manual intervention required" looks like.
 *
 * ── WHAT IT ADDS OVER THE ROW, AND WHY THAT IS FAIR ─────────────────────────
 * A line count ("3 items") and the tracking number when one exists. Both are
 * already in the order object the table is handed — the row leaves them out
 * because a table earns its density by having few columns, while a card has
 * the room. Nothing is computed that the data does not already contain.
 *
 * ── THE WHOLE CARD OPENS THE DRAWER ─────────────────────────────────────────
 * Same as clicking the row. It is a real <button> so it is tabbable and
 * answers Enter and Space, with the checkbox lifted out of it — a checkbox
 * inside a button is not a valid control, and stopping propagation on a nested
 * interactive element is a workaround for a structure that should not exist.
 */

type OrderData = {
  id: string;
  createdAt: Date;
  user: { name: string | null; email: string } | null;
  status: string;
  totalAmount: number;
  totalPaid?: number | null;
  printifyOrderId: string | null;
  trackingNumber?: string | null;
  items: { id: string; name: string; price: number; quantity: number }[];
};

export default function OrderCard({
  order,
  isSelected,
  onToggleSelect,
  onOpen,
}: {
  order: OrderData;
  isSelected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
}) {
  const shortId = order.id.substring(0, 5);
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <article
      style={{ borderColor: isSelected ? undefined : ADMIN_RULE }}
      className={`relative flex flex-col rounded-panel border bg-white transition-colors duration-200 ${
        isSelected ? 'border-accent-800 bg-accent-50/30' : 'hover:border-neutral-300'
      }`}
    >
      {/* The checkbox sits outside the card's own button, layered above it. */}
      <AdminCheckbox
        className="absolute right-3 top-3 z-10"
        checked={isSelected}
        onChange={onToggleSelect}
        label={`Select order ${shortId}`}
      />

      <button
        type="button"
        onClick={onOpen}
        className="flex flex-1 flex-col gap-3 rounded-panel p-3.5 pr-9 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-700/40"
      >
        {/* ── TOP: which order, what state ───────────────────────────────
            The id sits at the plain mono step. It was overridden up to 15px to
            make it the card's title and it did not need to be: a monospace
            string next to a coloured badge is already the most distinct thing
            on the card, and the size only made the card noisier. Weight and
            the ink colour carry it. */}
        <div className="flex flex-wrap items-center gap-2">
          <AdminMono className="font-semibold text-ink">#{shortId}</AdminMono>
          <StatusBadge status={order.status} />
        </div>

        {/* ── MIDDLE: who, and what is in it ───────────────────────────── */}
        <div className="min-w-0">
          <p className="type-admin-body truncate font-medium text-ink">
            {order.user?.email || 'Guest'}
          </p>
          <p className="type-admin-meta mt-0.5 text-neutral-500">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
            {order.trackingNumber && (
              <>
                <span aria-hidden className="px-1.5 text-neutral-300">
                  ·
                </span>
                <span className="truncate">
                  Tracking <AdminMono>{order.trackingNumber}</AdminMono>
                </span>
              </>
            )}
          </p>
        </div>

        {/* ── BOTTOM: the money, and when ──────────────────────────────── */}
        <div
          style={{ borderColor: ADMIN_RULE }}
          className="mt-auto flex items-end justify-between gap-3 border-t pt-2.5"
        >
          {/* The section step, not the stat step. A total on an order card is
              the number you look for, not a headline — 14px semibold and
              tabular is enough to find it instantly, and it leaves the card
              with one quiet hierarchy instead of a 24px figure dominating it. */}
          <span className="type-admin-section tabular-nums text-ink">
            ${(order.totalPaid || order.totalAmount).toFixed(2)}
          </span>
          <span className="type-admin-meta text-neutral-400">
            {/* `en-GB` fixes the format rather than leaving it to the viewer's
                locale — the same date must not render "3/9" on one admin's
                machine and "9/3" on another's. */}
            {new Date(order.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </button>
    </article>
  );
}
