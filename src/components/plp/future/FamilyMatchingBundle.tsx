"use client";

import { Users } from 'lucide-react';

/**
 * PLACEHOLDER — Family Matching Bundle Builder.
 *
 * The teaser only. A real builder needs a way to say "this adult print and this
 * kids print are the same design", which the catalogue cannot express yet.
 *
 * To finish it:
 *   1. Give products a shared `designId` (or a bundle join table) so an adult
 *      tee and its kids counterpart can be paired.
 *   2. Let the shopper pick a size per family member.
 *   3. Add the whole set to the bag in one action via `useCartStore`.
 *
 * Enable with `FUTURE_FEATURES.familyMatchingBundle`.
 */
export default function FamilyMatchingBundle({ onOpen }: { onOpen?: () => void }) {
  return (
    <section
      aria-label="Family matching bundles"
      className="mb-8 flex flex-col gap-3 rounded-panel border border-black/[0.06] bg-white/70 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/[0.06] text-accent-ink">
          <Users size={17} strokeWidth={1.9} />
        </span>
        <div>
          <p className="text-[14px] font-semibold text-ink">Matching for the whole family</p>
          <p className="type-caption mt-0.5 text-[12px] text-neutral-500">
            One print, every size — build a set in a couple of taps.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="type-button inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white px-6 text-[12px] uppercase tracking-[0.08em] text-ink transition-[background-color,border-color] duration-200 ease-out hover:border-neutral-400 hover:bg-neutral-50"
      >
        Build a Bundle
      </button>
    </section>
  );
}
