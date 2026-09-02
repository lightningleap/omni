"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DropdownOption {
  value: string;
  label: string;
  /** Optional flag / emoji shown before the label. */
  flag?: string;
}

/**
 * Generic searchable single-select dropdown. Data-driven and reusable — the
 * CountryDropdown and StateDropdown wrappers just feed it options. Handles
 * type-to-filter search, keyboard navigation (↑/↓/Enter), Escape + outside-click
 * to close, and a smooth open/close animation.
 */
export default function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select',
  searchPlaceholder = 'Search…',
  ariaLabel,
  disabled = false,
}: {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  // Escape + outside-click close
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Reset search + focus the input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const commit = (opt: DropdownOption) => {
    onChange(opt.value);
    setOpen(false);
  };

  const onInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) commit(filtered[activeIndex]);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="flex h-11 w-full items-center gap-2 rounded-xl border border-[rgb(var(--accent-shade-rgb)/0.12)] bg-white px-3 text-left text-[14px] font-medium text-accent-950 transition-colors duration-200 ease-out hover:border-[rgb(var(--accent-shade-rgb)/0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-800/25 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {selected?.flag && <span className="text-[17px] leading-none">{selected.flag}</span>}
        <span className="flex-1 truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          size={15}
          strokeWidth={2}
          className={`shrink-0 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-[70] overflow-hidden rounded-xl border border-[rgb(var(--accent-shade-rgb)/0.08)] bg-white shadow-[0_16px_40px_rgb(var(--accent-shade-rgb)/0.18)]"
          >
            <div className="flex items-center gap-2 border-b border-[rgb(var(--accent-shade-rgb)/0.08)] px-3">
              <Search size={15} className="shrink-0 text-neutral-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder={searchPlaceholder}
                aria-label={ariaLabel ? `Search ${ariaLabel}` : 'Search'}
                className="h-10 w-full bg-transparent text-[14px] text-accent-950 placeholder:text-neutral-400 focus:outline-none"
              />
            </div>

            <div role="listbox" aria-label={ariaLabel} className="max-h-56 overflow-y-auto py-1">
              {filtered.length === 0 && <p className="px-3 py-3 text-[13px] text-neutral-400">No results</p>}
              {filtered.map((o, i) => {
                const isSelected = o.value === value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => commit(o)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[14px] transition-colors duration-100 ${
                      i === activeIndex ? 'bg-[rgb(var(--accent-shade-rgb)/0.05)]' : ''
                    }`}
                  >
                    {o.flag && <span className="text-[16px] leading-none">{o.flag}</span>}
                    <span className="flex-1 truncate text-accent-950">{o.label}</span>
                    {isSelected && <Check size={15} strokeWidth={2.25} className="shrink-0 text-accent-800" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
