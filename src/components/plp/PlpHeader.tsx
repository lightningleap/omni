"use client";

import CategoryHeroTitle from '@/components/CategoryHeroTitle';

/**
 * Page header — category name, optional supporting line, live result count.
 *
 * Reuses the storefront's existing editorial title (`CategoryHeroTitle`, the
 * same one the collection pages use, qualifier form included) and the same
 * count pill, so a PLP reads as the catalogue it already is rather than a new
 * kind of page. The count is passed in from the filtered set, so it tracks
 * every filter change without a reload.
 */
export default function PlpHeader({
  title,
  qualifier,
  description,
  count,
}: {
  title: string;
  /** Optional leading segment, e.g. "Kids" in "Kids · Toddler". */
  qualifier?: string;
  description?: string;
  count: number;
}) {
  return (
    <header className="mb-10">
      <CategoryHeroTitle title={qualifier ? `${qualifier} · ${title}` : title} />

      {description && (
        <p className="type-body mt-4 max-w-[520px] text-neutral-500">{description}</p>
      )}

      <div className="mt-3 flex items-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent-950/10 bg-white/70 px-4 py-1.5 shadow-[0_2px_10px_rgb(var(--accent-shade-rgb)/0.05)] backdrop-blur-sm">
          <span className="text-[15px] font-semibold tracking-tight text-accent-950">{count}</span>
          <span className="type-caption text-[11px] uppercase tracking-[0.18em] text-neutral-400">
            {count === 1 ? 'Product' : 'Products'}
          </span>
        </span>
      </div>
    </header>
  );
}
