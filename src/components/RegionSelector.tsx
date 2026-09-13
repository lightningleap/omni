"use client";

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CountryDropdown from './CountryDropdown';
import StateDropdown from './StateDropdown';
import {
  getCountry,
  DEFAULT_COUNTRY_CODE,
  DEFAULT_STATE,
  DEFAULT_CURRENCY,
  DEFAULT_LANGUAGE,
} from '@/data/regions';

/**
 * Shopping-region selector for the navbar / mobile drawer.
 *
 * Presentational only — it does not change routing, pricing, or checkout. The
 * country + state data is config-driven (see src/data/regions.ts) so new markets
 * can be added without touching this component. Defaults to US / California, and
 * currency + language stay fixed at the US defaults for now.
 */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-neutral-500">{label}</span>
      <span className="text-[13px] font-medium text-accent-950">{value}</span>
    </div>
  );
}

export default function RegionSelector({
  variant = 'navbar',
  className = '',
}: {
  variant?: 'navbar' | 'drawer';
  className?: string;
}) {
  const isDrawer = variant === 'drawer';
  const [open, setOpen] = useState(false);
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [stateName, setStateName] = useState(DEFAULT_STATE);
  const rootRef = useRef<HTMLDivElement>(null);

  const country = getCountry(countryCode);

  // Changing country swaps the state list — reset to that country's first region
  // so states from another country are never shown.
  const onCountryChange = (code: string) => {
    setCountryCode(code);
    setStateName(getCountry(code).states[0] ?? '');
  };

  // Close the panel on outside click + Escape
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

  const panel = (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      role="dialog"
      aria-label="Shopping region"
      className={`z-50 w-[320px] max-w-[calc(100vw-2rem)] rounded-modal border border-[rgb(var(--accent-shade-rgb)/0.06)] bg-white p-5 shadow-[0_18px_44px_rgb(var(--accent-shade-rgb)/0.16)] ${
        isDrawer ? 'relative mt-3 w-full' : 'absolute right-0 top-[calc(100%+8px)]'
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Shopping Region</p>

      {/* Country / Region */}
      <label className="mb-2 mt-3 block text-[12px] font-medium text-neutral-500">Country / Region</label>
      <CountryDropdown value={countryCode} onChange={onCountryChange} />

      {/* State / Province — options follow the selected country */}
      <label className="mb-2 mt-4 block text-[12px] font-medium text-neutral-500">State / Province</label>
      <StateDropdown states={country.states} value={stateName} onChange={setStateName} />

      {/* Currency / Language — display fixed for now */}
      <div className="mt-5 space-y-2.5 border-t border-[rgb(var(--accent-shade-rgb)/0.08)] pt-4">
        <DetailRow label="Currency" value={DEFAULT_CURRENCY} />
        <DetailRow label="Language" value={DEFAULT_LANGUAGE} />
      </div>

      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-accent-800 text-[12px] font-semibold uppercase tracking-[0.1em] text-white transition-colors duration-200 ease-out hover:bg-accent-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-800/40 focus-visible:ring-offset-2"
      >
        Save Preferences
      </button>
    </motion.div>
  );

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Shopping region: ${country.name}`}
        className={`flex h-10 cursor-pointer items-center gap-2 rounded-full border border-[rgb(var(--accent-shade-rgb)/0.12)] bg-transparent px-[14px] text-[14px] font-medium text-accent-950 transition-colors duration-200 ease-out hover:border-[rgb(var(--accent-shade-rgb)/0.22)] hover:bg-[rgb(var(--accent-shade-rgb)/0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-800/25 ${
          isDrawer ? 'w-full justify-between' : ''
        }`}
      >
        <span className="text-[17px] leading-none">{country.flag}</span>
        {isDrawer ? (
          <span>{country.name}</span>
        ) : (
          <>
            <span className="hidden lg:inline">{country.name}</span>
            <span className="lg:hidden">{country.code}</span>
          </>
        )}
        <ChevronDown
          size={15}
          strokeWidth={2}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''} ${isDrawer ? 'ml-auto' : ''}`}
        />
      </button>

      <AnimatePresence>{open && panel}</AnimatePresence>
    </div>
  );
}
