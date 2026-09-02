"use client";

import { Gift } from 'lucide-react';

/**
 * PLACEHOLDER — Gift Finder entry point.
 *
 * The button a shopper would tap to start a guided quiz ("who is it for?" →
 * "what do they like?" → "budget?"). The quiz itself is not implemented.
 *
 * To finish it: build the question flow, map each answer onto a `FilterPatch`,
 * and apply the accumulated patches through `usePlpFilters` — the quiz then
 * lands the shopper on this same PLP, pre-filtered, with removable chips.
 *
 * Enable with `FUTURE_FEATURES.giftFinder`.
 */
export default function GiftFinderEntry({ onOpen }: { onOpen?: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="type-button inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-[#C56A4E]/40 bg-white px-4 text-[12px] tracking-[0.06em] text-[#C56A4E] transition-[background-color,border-color] duration-200 ease-out hover:border-[#C56A4E] hover:bg-[#C56A4E]/[0.06]"
    >
      <Gift aria-hidden size={14} strokeWidth={2} />
      Gift Finder
    </button>
  );
}
