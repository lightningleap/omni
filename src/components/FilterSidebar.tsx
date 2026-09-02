"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const SORT_OPTIONS = [
  { label: 'Featured', value: '', reverse: '' },
  { label: 'Price: Low → High', value: 'PRICE', reverse: 'false' },
  { label: 'Price: High → Low', value: 'PRICE', reverse: 'true' },
  { label: 'Newest', value: 'CREATED_AT', reverse: 'true' },
  { label: 'A → Z', value: 'TITLE', reverse: 'false' },
];

/* ── Section Wrapper ──────────────────────────────────── */
const FilterSection = ({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-100 pb-6 mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="type-label mb-4 flex w-full items-center justify-between text-neutral-900 transition-colors hover:text-[#ff3f6c]"
      >
        {title}
        <ChevronDown size={12} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface FilterSidebarProps {
  availableSizes: string[];
  isOpen: boolean;
  onClose: () => void;
}

const FilterSidebar = ({ availableSizes, isOpen, onClose }: FilterSidebarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // Read current filter state from URL
  const activeSize = searchParams.get('size') || '';
  const inStock = searchParams.get('inStock') === 'true';
  const activeSort = searchParams.get('sort') || '';
  const activeReverse = searchParams.get('reverse') || '';

  // Sync price inputs when URL changes externally
  useEffect(() => {
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
  }, [searchParams]);

  /* ── URL Update Helper ────────────────────────────── */
  const updateParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const qs = params.toString();
    router.push(`${window.location.pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [router, searchParams]);

  const updateMultipleParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    const qs = params.toString();
    router.push(`${window.location.pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [router, searchParams]);

  /* ── Price Debounce ───────────────────────────────── */
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (minPrice) params.set('minPrice', minPrice); else params.delete('minPrice');
      if (maxPrice) params.set('maxPrice', maxPrice); else params.delete('maxPrice');
      const qs = params.toString();
      const currentQs = searchParams.toString();
      if (qs !== currentQs) {
        router.push(`${window.location.pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Handle Sort ──────────────────────────────────── */
  const handleSort = (sortValue: string, reverseValue: string) => {
    updateMultipleParams({ sort: sortValue, reverse: reverseValue });
  };

  /* ── Determine which sizes to show ─────────── */
  const sizesToShow = availableSizes.length > 0
    ? availableSizes.filter(s => SIZE_OPTIONS.includes(s))
    : SIZE_OPTIONS;

  /* ── Filter Content ── */
  const filterContent = (
    <div className="space-y-0">
      {/* Availability */}
      <FilterSection title="Availability">
        <button
          onClick={() => updateParams('inStock', inStock ? '' : 'true')}
          className="flex items-center gap-3 group/toggle w-full"
        >
          <div className={`relative w-8 h-[18px] rounded-full transition-colors duration-300 ${
            inStock ? 'bg-[#ff3f6c]' : 'bg-neutral-200'
          }`}>
            <div className={`absolute top-[2px] w-3.5 h-3.5 rounded-full transition-all duration-300 ${
              inStock ? 'left-[14px] bg-white' : 'left-[2px] bg-white'
            }`} />
          </div>
          <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${inStock ? 'text-[#ff3f6c]' : 'text-neutral-500'}`}>
            In Stock Only
          </span>
        </button>
      </FilterSection>

      {/* Size Grid */}
      {sizesToShow.length > 0 && (
        <FilterSection title="Size">
          <div className="grid grid-cols-3 gap-2">
            {sizesToShow.map(size => {
              const isActive = activeSize.toUpperCase() === size;
              return (
                <button
                  key={size}
                  onClick={() => updateParams('size', isActive ? '' : size)}
                  className={`py-2 text-[10px] font-bold border transition-all duration-200 ${
                    isActive
                      ? 'bg-[#ff3f6c] text-white border-[#ff3f6c]'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-[#ff3f6c] hover:text-[#ff3f6c]'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">₹</span>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 text-[11px] font-bold py-2 pl-7 pr-3 placeholder:text-neutral-400 focus:outline-none focus:border-[#ff3f6c] transition-colors [appearance:textfield]"
              />
            </div>
            <span className="text-neutral-300 text-[10px]">—</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">₹</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 text-[11px] font-bold py-2 pl-7 pr-3 placeholder:text-neutral-400 focus:outline-none focus:border-[#ff3f6c] transition-colors [appearance:textfield]"
              />
            </div>
          </div>
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-[260px] flex-shrink-0 pr-8 sticky top-32 h-[calc(100vh-160px)] overflow-y-auto no-scrollbar border-r border-neutral-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="type-label text-black">Filters</h2>
          <button
            onClick={() => router.push(window.location.pathname, { scroll: false })}
            className="type-button text-[11px] uppercase tracking-[0.1em] text-[#ff3f6c] hover:underline"
          >
            Clear All
          </button>
        </div>
        {filterContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-[70] overflow-y-auto p-8 lg:hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <h2 className="type-label text-black">
                    Filters
                  </h2>
                  <button
                    onClick={() => router.push(window.location.pathname, { scroll: false })}
                    className="type-button text-[11px] uppercase tracking-[0.1em] text-[#ff3f6c]"
                  >
                    Clear All
                  </button>
                </div>
                <button onClick={onClose} className="p-2 text-neutral-400 hover:text-black">
                  <X size={18} />
                </button>
              </div>
              {filterContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FilterSidebar;
