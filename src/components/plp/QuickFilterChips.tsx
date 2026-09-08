"use client";

import type { FilterPatch, QuickChipDef } from '@/types/plp';

/**
 * Quick filter chips — the shortcuts that sit above the grid.
 *
 * Each chip carries a single-axis `FilterPatch` from the audience's config, so
 * tapping one writes into exactly the same filter state the sidebar does: the
 * sidebar checkbox and the chip stay in lockstep automatically, and the
 * selection shows up as a removable active chip like any other.
 *
 * The row scrolls horizontally rather than wrapping, matching the category rail
 * on the homepage, and hides its scrollbar via the site's `.no-scrollbar`.
 */
export default function QuickFilterChips({
  chips,
  isActive,
  onToggle,
}: {
  chips: QuickChipDef[];
  isActive: (patch: FilterPatch) => boolean;
  onToggle: (patch: FilterPatch) => void;
}) {
  if (!chips.length) return null;

  return (
    <div
      role="group"
      aria-label="Quick filters"
      className="no-scrollbar -mx-4 overflow-x-auto overscroll-x-contain px-4 md:-mx-12 md:px-12"
    >
      <div className="flex w-max gap-2 pb-1">
        {chips.map((chip) => {
          const active = isActive(chip.patch);
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onToggle(chip.patch)}
              aria-pressed={active}
              className={`type-button h-9 shrink-0 rounded-full border px-4 text-[12px] tracking-[0.06em] transition-[background-color,border-color,color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 ${
                active
                  ? 'border-accent bg-accent text-accent-on'
                  : 'border-neutral-300 bg-white text-ink hover:border-neutral-400 hover:bg-neutral-50'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
