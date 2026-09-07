"use client";

import React, { Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import CategoryDoodleBackground from './CategoryDoodleBackground';
import CategoryHeroTitle from './CategoryHeroTitle';

// --- Updated Interface to match Page props ---
interface CollectionClientProps {
  initialProducts: any[];
  categories?: string[]; 
  title?: string;
  user?: any;
}

/* ── Inner component that uses useSearchParams ─────── */
const CollectionInner = ({ initialProducts, title, user }: CollectionClientProps) => {
  /**
   * The server has already run the search — across name, description and
   * collection — so what arrives here is the result, not a pool to narrow.
   *
   * This used to re-filter the list on the NAME alone, which silently threw
   * away every match found any other way: a search for "cat" returned 44
   * products from the database and rendered none of them, because none happened
   * to carry the word in their title. Filtering twice, with the narrower rule
   * second, can only ever lose rows.
   */
  const filteredProducts = initialProducts;

  return (
    <main className="min-h-screen pt-12 pb-32 px-6 md:px-12">
      <CategoryDoodleBackground category={title} />
      <div className="max-w-[1400px] mx-auto">
        {/* Header Section */}
        <header className="mb-10">
          <CategoryHeroTitle title={title || 'The Archive'} />
          <div className="mt-3 flex items-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-950/10 bg-white/70 px-4 py-1.5 shadow-[0_2px_10px_rgb(var(--accent-shade-rgb)/0.05)] backdrop-blur-sm">
              <span className="text-[15px] font-semibold tracking-tight text-accent-950">
                {filteredProducts.length}
              </span>
              <span className="type-caption text-[11px] text-neutral-400 uppercase tracking-[0.18em]">
                {filteredProducts.length === 1 ? 'item' : 'items'}
              </span>
            </span>
          </div>
        </header>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-16 mt-4">
          <AnimatePresence>
            {filteredProducts.map((product, index) => (
              <ProductCard key={product._id || product.slug} product={product} index={index} user={user} />
            ))}
          </AnimatePresence>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-40 text-center">
            <p className="type-label text-neutral-400">
              Currently no pieces in this collection.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

/* ── Wrapper with Suspense boundary ───────────────── */
const CollectionClient = ({ initialProducts, categories, title, user }: CollectionClientProps) => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="type-label animate-pulse text-black">
          Loading Filters...
        </div>
      </div>
    }>
      <CollectionInner initialProducts={initialProducts} categories={categories} title={title} user={user} />
    </Suspense>
  );
};

export default CollectionClient;
