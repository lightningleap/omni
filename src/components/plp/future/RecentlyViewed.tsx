"use client";

import ProductCard from '@/components/ProductCard';
import SectionHeader from '@/components/SectionHeader';
import type { HomepageUser } from '@/data/homepage';
import type { PlpProduct } from '@/types/plp';

/**
 * PLACEHOLDER — Recently Viewed.
 *
 * Deliberately a *shared* component: it takes products and renders them with
 * the standard card, so the PLP, the PDP and the bag can all mount the same
 * one. What it does not have is a source — nothing records views yet.
 *
 * To finish it: record product ids in a small persisted store (the pattern the
 * cart and wishlist already use — `store/useWishlistStore.ts`), hydrate them
 * into `PlpProduct`s, and pass them in here.
 *
 * Enable with `FUTURE_FEATURES.recentlyViewed`.
 */
export default function RecentlyViewed({
  products,
  user,
  title = 'Recently Viewed',
}: {
  products: PlpProduct[];
  user?: HomepageUser | null;
  title?: string;
}) {
  if (!products.length) return null;

  return (
    <section aria-label={title} className="mt-24">
      <SectionHeader title={title} />
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {products.slice(0, 4).map((product, index) => (
          <ProductCard key={product._id} product={product} index={index} user={user} />
        ))}
      </div>
    </section>
  );
}
