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
 * The Filter button is hidden from `lg` up, where the sidebar is always visible
 * and a button to summon it would be dead weight.
 */
export default function PlpToolbar({
  total,
  activeCount,
  sorts,
  sort,
  onSortChange,
  onOpenFilters,
}: {
  total: number;
  /** Number of active filters — badged on the Filter button. */
  activeCount: number;
  sorts: SortOptionDef[];
  sort: SortKey;
  onSortChange: (value: SortKey) => void;
  onOpenFilters: () => void;
}) {
  return (
    <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-black/[0.06] bg-[#F8F6F2]/95 px-4 py-3 backdrop-blur-[10px] md:top-[76px] md:-mx-12 md:px-12">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenFilters}
          className="type-button inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 text-[12px] uppercase tracking-[0.08em] text-[#1A1A1A] transition-[background-color,border-color] duration-200 ease-out hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 lg:hidden"
        >
          <SlidersHorizontal aria-hidden size={15} strokeWidth={2} />
          Filter
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-on">
              {activeCount}
            </span>
          )}
        </button>

        <p className="type-caption hidden text-[11px] uppercase tracking-[0.18em] text-neutral-500 sm:block">
          {total} {total === 1 ? 'Product' : 'Products'}
        </p>

        <div className="ml-auto">
          <SortDropdown options={sorts} value={sort} onChange={onSortChange} />
        </div>
      </div>
    </div>
  );
}
