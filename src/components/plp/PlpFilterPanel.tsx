"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import FilterGroup from './FilterGroup';
import QuickFilterChips from './QuickFilterChips';
import type { AttributeKey, FacetCounts, FilterConfig, FilterPatch, QuickChipDef } from '@/types/plp';

/**
 * The filter panel — a slide-over drawer, at every breakpoint, opened from the
 * Filter control in the toolbar. It renders the group list from the audience's
 * config, so Adult and Kids get their own facets from one component.
 *
 * Price is the one control that can't write straight through: typing "2" in a
 * min field would filter to ≥ 2 before the shopper finishes typing "25". It is
 * held locally and committed on a short debounce (the same 600ms the existing
 * collection filters use), while every other control commits instantly.
 */

const PRICE_DEBOUNCE_MS = 600;

interface PlpFilterPanelProps {
  config: FilterConfig;
  counts: FacetCounts;
  isFacetActive: (key: AttributeKey, value: string) => boolean;
  toggleFacet: (key: AttributeKey, value: string) => void;
  minPrice: number | null;
  maxPrice: number | null;
  setPriceRange: (min: number | null, max: number | null) => void;
  isFiltered: boolean;
  clearAll: () => void;
  /** Drawer visibility — the only presentation, at every breakpoint. */
  isOpen: boolean;
  onClose: () => void;
  /**
   * The audience's quick filters (New, Trending, Under $999, Oversized …).
   *
   * These used to sit on the page as a permanent row of pills above the grid.
   * They are shortcuts INTO filtering, so they belong with the filters: on the
   * page they were a third pill row competing with the department rail and the
   * toolbar, and they pushed the products further down for a set of options
   * most shoppers scroll straight past.
   */
  quickChips: QuickChipDef[];
  isQuickChipActive: (patch: FilterPatch) => boolean;
  onToggleQuickChip: (patch: FilterPatch) => void;
}

export default function PlpFilterPanel({
  config,
  counts,
  isFacetActive,
  toggleFacet,
  minPrice,
  maxPrice,
  setPriceRange,
  isFiltered,
  clearAll,
  isOpen,
  onClose,
  quickChips,
  isQuickChipActive,
  onToggleQuickChip,
}: PlpFilterPanelProps) {
  const [draft, setDraft] = useState({ min: minPrice, max: maxPrice });

  // Adopt external changes (a quick chip, Clear All) without fighting typing.
  // Adjusted during render rather than in an effect, so the inputs never paint
  // one frame of the stale value before catching up.
  const [committed, setCommitted] = useState({ min: minPrice, max: maxPrice });
  if (committed.min !== minPrice || committed.max !== maxPrice) {
    setCommitted({ min: minPrice, max: maxPrice });
    setDraft({ min: minPrice, max: maxPrice });
  }

  useEffect(() => {
    if (draft.min === minPrice && draft.max === maxPrice) return;
    const timer = setTimeout(() => setPriceRange(draft.min, draft.max), PRICE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft, minPrice, maxPrice, setPriceRange]);

  // Close the drawer on Escape — a slide-over that only closes by tap is a trap
  // for keyboard users.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const groups = (
    <div>
      {config.groups.map((group) => (
        <FilterGroup
          key={group.id}
          group={group}
          counts={counts}
          isActive={isFacetActive}
          onToggle={toggleFacet}
          price={draft}
          onPriceChange={(min, max) => setDraft({ min, max })}
        />
      ))}
    </div>
  );

  return (
    <>
      {/* ── Slide-over drawer, at every breakpoint ──────────────────────────
          This used to be a drawer below `lg` and a persistent 260px sidebar
          above it. The sidebar was the single biggest layout problem on the
          page: it took a fixed column out of the content width on every desktop
          visit — whether or not the shopper ever filtered — and left the grid
          narrower than the space it had, so a 4-up row of cards sat pushed to
          the right with the page's own margin stranded beside it.

          Filtering is an occasional act; browsing is continuous. Reserving
          permanent width for the occasional one, at the cost of the continuous
          one, had it backwards. One drawer for all widths also means one code
          path — the desktop and mobile filter experiences can no longer drift,
          and there is no breakpoint at which the Filter button and the panel
          disagree about who is in charge. */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[80] bg-ink/50 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-[80] w-80 max-w-[85vw] overflow-y-auto bg-white p-8"
            >
              <div className="mb-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="type-label text-ink">Filters</h2>
                  {isFiltered && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="type-button text-[11px] uppercase tracking-[0.1em] text-brand-terracotta"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close filters"
                  className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 transition-colors duration-200 hover:bg-neutral-100 hover:text-ink"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
              {quickChips.length > 0 && (
                <div className="mb-8 border-b border-black/[0.06] pb-8">
                  <h3 className="type-label mb-4 text-neutral-500">Quick Filters</h3>
                  <QuickFilterChips
                    chips={quickChips}
                    isActive={isQuickChipActive}
                    onToggle={onToggleQuickChip}
                  />
                </div>
              )}

              {groups}

              {/* Every control above commits immediately, so this closes the
                  drawer rather than submitting anything — the results behind it
                  are already filtered. Named "Apply" because that is what the
                  gesture means to a shopper who has just made choices; naming it
                  "Close" would imply the choices might not have taken. */}
              <div className="sticky bottom-0 -mx-8 mt-8 border-t border-black/[0.06] bg-white px-8 pb-2 pt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="type-button inline-flex h-12 w-full items-center justify-center rounded-full bg-accent px-6 text-[12px] uppercase tracking-[0.14em] text-accent-on transition-[background-color,color] duration-200 ease-out hover:bg-accent-950 hover:text-accent-on-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
