"use client";

import React, { useCallback, useSyncExternalStore } from 'react';
import { LayoutGrid, List } from 'lucide-react';

/**
 * List ↔ card view, shared by Products, Collections and Orders.
 *
 * ── WHAT THIS IS AND IS NOT ─────────────────────────────────────────────────
 * This file holds the SWITCH and the GRID — the parts every section needs
 * identically. It deliberately does not hold the cards: a product card, a
 * collection card and an order card are three different designs answering
 * three different questions, and a generic `<AdminCard>` with a dozen optional
 * slots would be a worse component than three honest ones. They live in
 * `components/admin/cards/`.
 *
 * ── THE VIEW IS PRESENTATION, AND NOTHING ELSE ──────────────────────────────
 * Every section keeps ONE set of state: one search string, one filter, one
 * selection set, one set of handlers. The view flag chooses which tree renders
 * the already-filtered array — it is never an input to filtering, fetching or
 * any action. That is what makes "search, switch view, see the same results"
 * true by construction rather than by being careful.
 */

export type AdminView = 'list' | 'cards';

/* ── PERSISTENCE ───────────────────────────────────────────────────────────
   Which view an admin prefers is a per-browser preference, so localStorage —
   the same place the storefront keeps its mode, and no server round trip.

   It is read through `useSyncExternalStore` rather than an effect, for the
   reason spelled out in `useHomepageMode`: the server has no localStorage, so
   it must render the default, and an effect that then setStates the stored
   value is a second render React flags as a cascading one. `getServerSnapshot`
   supplies the default for SSR; the stored value is applied in the same commit
   as hydration. It also makes the preference shared across sections' toggles
   and across browser tabs for free, via the `storage` event.

   Key is per section (`admin-view:products`), because the right view for a
   catalogue of photographs is not the right view for a table of orders. */
const storageKey = (section: string) => `unrwly-admin-view:${section}`;

const listeners = new Set<() => void>();

/** Notify every mounted toggle — this tab's, and any other tab's via `storage`. */
const emit = () => listeners.forEach((l) => l());

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  window.addEventListener('storage', emit);
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) window.removeEventListener('storage', emit);
  };
};

function readView(section: string): AdminView {
  // Private browsing and blocked site data both throw on access rather than
  // returning null, so this is a try/catch and not a null check.
  try {
    return window.localStorage.getItem(storageKey(section)) === 'cards' ? 'cards' : 'list';
  } catch {
    return 'list';
  }
}

function writeView(section: string, view: AdminView) {
  try {
    window.localStorage.setItem(storageKey(section), view);
  } catch {
    // Storage unavailable. The in-memory value below still updates, so the
    // switch works for this session — it just will not be remembered.
  }
}

/**
 * The last value read per section.
 *
 * `useSyncExternalStore` compares snapshots by identity and re-reads on every
 * render, so the getter must return a STABLE value or React loops forever.
 * localStorage returns a fresh string each call, hence this cache: it is
 * updated only when the value actually changes.
 */
const cache = new Map<string, AdminView>();

function getSnapshot(section: string): AdminView {
  const next = readView(section);
  if (cache.get(section) !== next) cache.set(section, next);
  return cache.get(section)!;
}

/**
 * The section's current view, and a setter that persists it.
 *
 * `list` on the server and on the very first client paint, so the list view —
 * which is the studio's default and the denser of the two — is what renders
 * before a preference is known.
 */
export function useAdminView(section: string): [AdminView, (view: AdminView) => void] {
  const view = useSyncExternalStore(
    subscribe,
    () => getSnapshot(section),
    () => 'list' as AdminView
  );

  const setView = useCallback(
    (next: AdminView) => {
      if (cache.get(section) === next) return;
      cache.set(section, next);
      writeView(section, next);
      emit();
    },
    [section]
  );

  return [view, setView];
}

/**
 * The switch itself.
 *
 * A two-button segmented control: a recessed track with the active view raised
 * out of it on a white plate. The active state is carried by that plate — a
 * background, a border and a shadow — and by `aria-pressed`, so it is legible
 * without colour vision and announced without sight. Colour only reinforces it.
 *
 * Deliberately small and quiet. It sits beside a search field in a toolbar, it
 * is pressed once and then forgotten, and a large prominent control there would
 * out-shout the page's actual actions.
 */
export function AdminViewToggle({
  view,
  onChange,
  className = '',
}: {
  view: AdminView;
  onChange: (view: AdminView) => void;
  className?: string;
}) {
  const options: { value: AdminView; label: string; Icon: typeof List }[] = [
    { value: 'list', label: 'List view', Icon: List },
    { value: 'cards', label: 'Card view', Icon: LayoutGrid },
  ];

  return (
    <div
      role="group"
      aria-label="Choose a view"
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-card border border-[#E8E6E1] bg-[#FBFAF8] p-0.5 ${className}`}
    >
      {options.map(({ value, label, Icon }) => {
        const active = view === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            aria-pressed={active}
            aria-label={label}
            title={label}
            className={`flex h-7 w-7 items-center justify-center rounded-[3px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30 focus-visible:ring-offset-1 ${
              active
                ? 'border border-[#E8E6E1] bg-white text-accent-800 shadow-sm'
                : 'border border-transparent text-neutral-400 hover:text-ink'
            }`}
          >
            <Icon aria-hidden size={14} strokeWidth={1.75} />
          </button>
        );
      })}
    </div>
  );
}

/**
 * The card grid.
 *
 * `auto-fill` + `minmax(min, 1fr)`, so the column count is decided by the space
 * the grid actually has rather than by a breakpoint ladder. That matters here
 * more than usual: the admin content column is 240px narrower than the viewport
 * once the sidebar rail appears at `lg`, so a `lg:grid-cols-4` written against
 * viewport width would be wrong by one column at exactly the width it was
 * tuned for. This cannot be wrong — it measures the container.
 *
 * It also means mobile needs no special case. Below `min` + the gap there is
 * room for one column, so one is what renders, full width.
 *
 * `min` is per section rather than shared: an order card carries four lines of
 * text and wants to be wider than a product tile, which is mostly a photograph.
 */
export function AdminCardGrid({
  children,
  min = 240,
  className = '',
}: {
  children: React.ReactNode;
  /** Narrowest a card may get before the grid drops a column, in px. */
  min?: number;
  className?: string;
}) {
  return (
    <div
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}px, 100%), 1fr))` }}
      className={`grid gap-4 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * The card view's loading skeleton — the counterpart to `AdminTableSkeleton`,
 * shaped like the grid it stands in for so the panel does not jump.
 *
 * Neither is wired up today: all three sections render server-fetched data, so
 * there is no moment where the client holds an empty list. They exist as the
 * pair a section reaches for when one is needed, and shipping only the table
 * half would mean the card view had no answer.
 */
export function AdminCardGridSkeleton({ count = 8, min = 240 }: { count?: number; min?: number }) {
  return (
    <AdminCardGrid min={min}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="overflow-hidden rounded-panel border border-[#E8E6E1] bg-white"
        >
          <div className="aspect-[4/3] w-full animate-pulse bg-[#F1EFEA]" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-3/4 animate-pulse rounded-full bg-[#F1EFEA]" />
            <div className="h-3 w-1/3 animate-pulse rounded-full bg-[#F1EFEA]" />
          </div>
        </div>
      ))}
    </AdminCardGrid>
  );
}
