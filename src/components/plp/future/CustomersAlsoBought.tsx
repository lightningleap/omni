"use client";

import ProductCard from '@/components/ProductCard';
import SectionHeader from '@/components/SectionHeader';
import type { HomepageUser } from '@/data/homepage';
import type { PlpProduct } from '@/types/plp';

/**
 * PLACEHOLDER — "Customers Also Bought", for the Product Detail Page.
 *
 * Built but NOT mounted: the brief says the existing PDP must not change, so
 * this waits here until you choose to drop it in.
 *
 * The recommendation itself is a real, cheap query away — `OrderItem` already
 * links products to orders, so co-purchase pairs can be aggregated server-side
 * ("orders containing X, most common other product") without any new schema.
 * That query is the only piece missing.
 *
 * Enable with `FUTURE_FEATURES.customersAlsoBought`, then render it on the PDP
 * with the products that query returns.
 */
export default function CustomersAlsoBought({
  products,
  user,
}: {
  products: PlpProduct[];
  user?: HomepageUser | null;
}) {
  if (!products.length) return null;

  return (
    <section aria-label="Customers also bought" className="mt-24">
      <SectionHeader
        title="Customers Also Bought"
        subtitle="Frequently bought together with this piece."
      />
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {products.slice(0, 4).map((product, index) => (
          <ProductCard key={product._id} product={product} index={index} user={user} />
        ))}
      </div>
    </section>
  );
}
