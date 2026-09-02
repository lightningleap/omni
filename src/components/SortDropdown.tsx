"use client";

import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import type { SortKey, SortOptionDef } from '@/types/sorting';

/**
 * Sort control — a compact pill that opens its options in place.
 *
 * Built rather than borrowed from a native `<select>` so it carries the same
 * rounded-full, tracked-caps language as every other control on the site.
 * Closes on outside click and Escape, and returns focus to the trigger.
 *
 * Shared by the PLP toolbar and the homepage section headers. `size="sm"` is the
 * section-header variant: the same control a step smaller, so it reads as a
 * quiet affordance beside a heading rather than competing with it.
 */
export default function SortDropdown({
  options,
  value,
  onChange,
  size = 'md',
}: {
  options: SortOptionDef[];
  value: SortKey;
  onChange: (value: SortKey) => void;
  size?: 'sm' | 'md';
}) {
  const trigger =
    size === 'sm'
      ? 'h-10 px-4 text-[11px]'
      : 'h-11 px-5 text-[12px]';
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const active = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className={`type-button inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white uppercase tracking-[0.08em] text-[#1A1A1A] transition-[background-color,border-color] duration-200 ease-out hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 ${trigger}`}
      >
        <span className="text-neutral-400">Sort</span>
        <span>{active?.label}</span>
        <ChevronDown
          aria-hidden
          size={14}
          strokeWidth={2}
          className={`text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          id={menuId}
          role="listbox"
          aria-label="Sort products by"
          className="absolute right-0 z-40 mt-2 w-60 overflow-hidden rounded-[10px] border border-black/[0.06] bg-white py-1.5 shadow-[0_18px_40px_-16px_rgb(var(--accent-shade-rgb)/0.28)]"
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[13px] transition-colors duration-150 hover:bg-neutral-50 ${
                    selected ? 'font-semibold text-accent-ink' : 'text-neutral-600'
                  }`}
                >
                  {option.label}
                  {selected && <Check size={14} strokeWidth={2.5} className="shrink-0 text-accent-ink" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
