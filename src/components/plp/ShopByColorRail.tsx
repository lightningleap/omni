"use client";

import type { FacetCounts, FilterOption } from '@/types/plp';

/**
 * "Shop by Colour" — the Kids-only browse rail that sits above the grid.
 *
 * Colour is how a child picks, so it gets its own row rather than being buried
 * in the sidebar. Tapping a swatch writes to the same `colors` facet the
 * sidebar's colour group uses, which means the grid updates instantly, the
 * sidebar swatch reflects it, and an active chip appears — all for free, with
 * no code path of its own.
 *
 * Scrolls horizontally on every size (eleven swatches never fit a phone), with
 * the scrollbar hidden via the site's `.no-scrollbar`.
 */
export default function ShopByColorRail({
  colors,
  counts,
  isActive,
  onToggle,
}: {
  colors: FilterOption[];
  counts: FacetCounts;
  isActive: (value: string) => boolean;
  onToggle: (value: string) => void;
}) {
  if (!colors.length) return null;

  return (
    <section aria-label="Shop by colour" className="mb-8">
      <h2 className="type-label mb-4 text-neutral-500">Shop by Colour</h2>

      <div className="no-scrollbar -mx-4 overflow-x-auto overscroll-x-contain px-4 md:-mx-12 md:px-12">
        <div className="flex w-max gap-4 pb-1">
          {colors.map((color) => {
            const active = isActive(color.value);
            const count = counts[`colors:${color.value}`] ?? 0;
            const unavailable = count === 0 && !active;

            return (
              <button
                key={color.value}
                type="button"
                onClick={() => onToggle(color.value)}
                disabled={unavailable}
                aria-pressed={active}
                title={unavailable ? `No products currently tagged ${color.label}` : color.label}
                className="group/col flex w-[62px] shrink-0 flex-col items-center gap-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span
                  aria-hidden
                  style={{ background: color.swatch }}
                  className={`h-12 w-12 rounded-full transition-[transform,box-shadow] duration-200 ease-out group-hover/col:scale-105 group-focus-visible/col:scale-105 ${
                    color.swatchBordered ? 'ring-1 ring-inset ring-black/10' : ''
                  } ${
                    active
                      ? 'shadow-[0_0_0_2px_#FFFFFF,0_0_0_4px_var(--accent-900)]'
                      : 'shadow-[0_2px_8px_rgba(20,20,25,0.16)]'
                  }`}
                />
                <span
                  className={`w-full truncate text-center text-[11px] leading-tight transition-colors duration-200 ${
                    active ? 'font-semibold text-accent-ink' : 'text-neutral-500'
                  }`}
                >
                  {color.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
