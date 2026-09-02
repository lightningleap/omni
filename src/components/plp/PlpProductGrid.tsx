"use client";

import { useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import type { HomepageUser } from '@/data/homepage';
import type { PlpProduct } from '@/types/plp';

/**
 * The product grid.
 *
 * `ProductCard` is rendered exactly as the rest of the site renders it — same
 * component, same props, same size, same hover, same wishlist and Quick Add.
 * The grid columns and gutters are the catalogue's existing ones, carried over
 * unchanged.
 *
 * ── Why it doesn't flicker ───────────────────────────────────────────────────
 * Cards are keyed by product id, so a card that survives a filter change is
 * never unmounted — React moves it and nothing re-animates. Only genuinely new
 * cards mount, and after the shopper's first interaction they skip the
 * index-staggered entry (`stagger`), because a 0.05s-per-card waterfall is a
 * pleasant first impression but reads as lag when it replays on every tick of a
 * checkbox.
 */

/** How many products render before "Load More". */
const PAGE_SIZE = 24;

export default function PlpProductGrid({
  products,
  user,
  stagger,
  onClearAll,
  isFiltered,
  fallback,
}: {
  products: PlpProduct[];
  user?: HomepageUser | null;
  stagger: boolean;
  onClearAll: () => void;
  /** Whether the shopper has narrowed anything themselves. */
  isFiltered: boolean;
  /** Where to send someone when the category itself is empty. */
  fallback?: { label: string; href: string };
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  // A new result set starts from the top again, otherwise a shopper who had
  // loaded 96 products keeps a fully-expanded page after filtering down to 30.
  // Adjusted during render (React's derive-from-props pattern) so the first
  // paint after a filter change is already the correct page.
  const [seenCount, setSeenCount] = useState(products.length);
  if (seenCount !== products.length) {
    setSeenCount(products.length);
    setVisible(PAGE_SIZE);
  }

  if (!products.length) {
    // Two very different empty states. If the shopper narrowed their way here,
    // clearing gets them out. If they didn't, the category itself has nothing —
    // offering "Clear All Filters" would be a button that visibly does nothing,
    // so send them somewhere that does have stock instead.
    const action = isFiltered ? (
      <button
        type="button"
        onClick={onClearAll}
        className="type-button mt-6 inline-flex h-12 items-center rounded-full border border-neutral-300 px-7 text-[12px] uppercase tracking-[0.08em] text-[#1A1A1A] transition-[background-color,border-color] duration-200 ease-out hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2"
      >
        Clear All Filters
      </button>
    ) : fallback ? (
      <Link
        href={fallback.href}
        className="type-button mt-6 inline-flex h-12 items-center rounded-full border border-neutral-300 px-7 text-[12px] uppercase tracking-[0.08em] text-[#1A1A1A] transition-[background-color,border-color] duration-200 ease-out hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2"
      >
        Browse {fallback.label}
      </Link>
    ) : null;

    return (
      <div className="py-32 text-center">
        <p className="type-label text-neutral-400">
          {isFiltered ? 'No products match these filters.' : 'Nothing in this edit just yet.'}
        </p>
        {action}
      </div>
    );
  }

  const shown = products.slice(0, visible);
  const remaining = products.length - shown.length;

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((product, index) => (
          <ProductCard
            key={product._id}
            product={product}
            index={stagger ? index : 0}
            user={user}
          />
        ))}
      </div>

      {remaining > 0 && (
        <div className="mt-20 flex flex-col items-center gap-4">
          <p className="type-caption text-[11px] uppercase tracking-[0.18em] text-neutral-400">
            Showing {shown.length} of {products.length}
          </p>
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="type-button inline-flex h-14 items-center gap-2 rounded-full bg-accent px-10 text-[12px] uppercase tracking-[0.14em] text-accent-on shadow-[0_10px_24px_-12px_rgb(var(--accent-ring-rgb)/0.6)] transition-[transform,background-color,box-shadow] duration-[250ms] ease-out hover:-translate-y-0.5 hover:bg-accent-950 hover:text-accent-on-strong hover:shadow-[0_16px_30px_-12px_rgb(var(--accent-ring-rgb)/0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
}
