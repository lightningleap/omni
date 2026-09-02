"use client";

import { Ruler } from 'lucide-react';

/**
 * PLACEHOLDER — Kids Size & Age Predictor.
 *
 * Ships the entry point only: the prompt and the affordance a parent would tap.
 * The recommendation itself needs data this project does not have yet — a size
 * chart per garment (age → chest/height → size) and the product's actual size
 * run.
 *
 * To finish it:
 *   1. Add a size chart to the catalogue (or a shared kids chart in `filters/`).
 *   2. Take the child's age/height in a small dialog opened from this button.
 *   3. Resolve a size and write it straight into `sizes` via `toggleFacet` —
 *      the PLP will filter to it with no further work.
 *
 * Enable with `FUTURE_FEATURES.sizeAgePredictor`.
 */
export default function SizeAgePredictor({ onOpen }: { onOpen?: () => void }) {
  return (
    <div className="mb-8 flex flex-col gap-3 rounded-[10px] border border-black/[0.06] bg-white/70 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/[0.06] text-accent-ink">
          <Ruler size={17} strokeWidth={1.9} />
        </span>
        <div>
          <p className="text-[14px] font-semibold text-[#1A1A1A]">How old is your child?</p>
          <p className="type-caption mt-0.5 text-[12px] text-neutral-500">
            We&apos;ll suggest the right size.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="type-button inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white px-6 text-[12px] uppercase tracking-[0.08em] text-[#1A1A1A] transition-[background-color,border-color] duration-200 ease-out hover:border-neutral-400 hover:bg-neutral-50"
      >
        Find Their Size
      </button>
    </div>
  );
}
