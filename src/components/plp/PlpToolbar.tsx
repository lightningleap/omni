"use client";

import { SlidersHorizontal } from 'lucide-react';
import SortDropdown from '@/components/SortDropdown';
import type { SortKey, SortOptionDef } from '@/types/plp';

/**
 * The sticky Filter & Sort bar.
 *
 * Sticks directly beneath the navbar (64px on mobile, 76px from `md`) so the
 * two controls a shopper reaches for most stay reachable however far they have
 * scrolled. Backed by the page's own off-white with a blur, so the grid passes
 * behind it cleanly.
 *
 * ── WHY THE FILTER BUTTON IS NOW ALWAYS PRESENT ─────────────────────────────
 * It used to carry `lg:hidden`, because from `lg` up a persistent sidebar held
 * the filters and a button to summon it would have been dead weight. That
 * sidebar is gone (see `PlpFilterPanel`), so this control is now the only way
 * into filtering at every width — and the two can no longer disagree about
 * which of them is in charge at a given breakpoint.
 *
 * ── WHY THERE IS NO PRODUCT COUNT HERE ──────────────────────────────────────
 * There was one, and `PlpHeader` prints the same number a few rows above it.
 * Two live counts saying the same thing is not redundancy that reassures, it is
 * one more thing to read on the way to the products. The header keeps it: it
 * belongs with the collection's identity, next to the title and description
 * that say what is being counted.
 */
export default function PlpToolbar({
  activeCount,
  sorts,
  sort,
  onSortChange,
  onOpenFilters,
}: {
  /** Number of active filters — badged on the Filter button. */
  activeCount: number;
  sorts: SortOptionDef[];
  sort: SortKey;
  onSortChange: (value: SortKey) => void;
  onOpenFilters: () => void;
}) {
  return (
    <div className="sticky top-16 z-30 -mx-4 mb-6 border-y border-black/[0.06] bg-[#F8F6F2]/95 px-4 py-3 backdrop-blur-[10px] md:top-[76px] md:-mx-12 md:px-12">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenFilters}
          aria-haspopup="dialog"
          className="type-button inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 text-[12px] uppercase tracking-[0.08em] text-ink transition-[background-color,border-color] duration-200 ease-out hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2"
        >
          <SlidersHorizontal aria-hidden size={15} strokeWidth={2} />
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-on">
              {activeCount}
            </span>
          )}
        </button>

        <div className="ml-auto">
          <SortDropdown options={sorts} value={sort} onChange={onSortChange} />
        </div>
      </div>
    </div>
  );
}
