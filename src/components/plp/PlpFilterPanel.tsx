"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import FilterGroup from './FilterGroup';
import type { AttributeKey, FacetCounts, FilterConfig } from '@/types/plp';

/**
 * The filter panel — a persistent sidebar from `lg` up, a slide-over drawer
 * below it. Both render the SAME group list from the audience's config, so the
 * two presentations can never drift apart.
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
  /** Mobile / tablet drawer. */
  isOpen: boolean;
  onClose: () => void;
}

function PanelHeading({ isFiltered, clearAll }: { isFiltered: boolean; clearAll: () => void }) {
  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <h2 className="type-label text-[#1A1A1A]">Filters</h2>
      {isFiltered && (
        <button
          type="button"
          onClick={clearAll}
          className="type-button text-[11px] uppercase tracking-[0.1em] text-[#C56A4E] transition-opacity duration-200 hover:opacity-70"
        >
          Clear All
        </button>
      )}
    </div>
  );
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
      {/* ── Desktop: persistent sidebar, scrolls with its own overflow ── */}
      <aside className="no-scrollbar sticky top-32 hidden h-[calc(100vh-160px)] w-[260px] shrink-0 overflow-y-auto border-r border-black/[0.06] pr-8 lg:block">
        <PanelHeading isFiltered={isFiltered} clearAll={clearAll} />
        {groups}
      </aside>

      {/* ── Tablet & mobile: slide-over drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-[80] w-80 max-w-[85vw] overflow-y-auto bg-white p-8 lg:hidden"
            >
              <div className="mb-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="type-label text-[#1A1A1A]">Filters</h2>
                  {isFiltered && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="type-button text-[11px] uppercase tracking-[0.1em] text-[#C56A4E]"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close filters"
                  className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 transition-colors duration-200 hover:bg-neutral-100 hover:text-[#1A1A1A]"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
              {groups}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
