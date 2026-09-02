"use client";

import SectionHeader from '@/components/SectionHeader';
import ProductCategorySection from '@/components/ProductCategorySection';
import SortDropdown from '@/components/SortDropdown';
import ModeFade from '@/components/home/ModeFade';
import { useHomepageContent, useHomepageMode } from '@/store/useHomepageMode';
import { useSorting } from '@/hooks/useSorting';
import { groupByCategory } from '@/data/productCategories';
import type { HomepageDataByMode, HomepageUser } from '@/data/homepage';

/**
 * The main product feed — the homepage's primary content, sitting directly
 * below the collection circles.
 *
 * ── ONE GRID BECAME FIVE STRIPS ─────────────────────────────────────────────
 * This used to render the whole catalogue as one continuous grid: products,
 * products, products, with nothing telling a shopper where the tees ended and
 * the mugs began. It is now grouped into category strips — T-Shirts, Hoodies &
 * Sweatshirts, Totes & Bags, Hats & Accessories, Mugs — each with its own
 * heading and its own horizontal rail (see `ProductCategorySection`).
 *
 * The grouping is data, not markup: `groupByCategory` reads the registry in
 * `data/productCategories.ts`, so re-ordering the strips, renaming one or
 * changing a row count is an edit there and nothing here. No product is written
 * out twice and none is dropped — a type the registry doesn't recognise lands in
 * its catch-all strip.
 *
 * ── WHAT DID NOT CHANGE ─────────────────────────────────────────────────────
 * The card, and everything on it. The Adult/Kids toggle still swaps the whole
 * feed through the same `ModeFade`. The sort control still sits in the section
 * header's action slot, and still works across the lot: the feed sorts FIRST and
 * groups after, so every strip comes out in the chosen order.
 */
export default function ProductFeedSection({
  data,
  user,
}: {
  data: HomepageDataByMode;
  user?: HomepageUser | null;
}) {
  const { mode } = useHomepageMode();
  const { productFeed } = useHomepageContent();
  const { products } = data[mode];

  const { sorted, sort, setSort, options } = useSorting(products, mode);

  // Sort first, group second — so the shopper's chosen order survives into
  // every strip instead of each one falling back to catalogue order.
  const groups = groupByCategory(sorted);

  if (!products.length) return null;

  // Where each strip starts in the feed as a whole. The card uses its index to
  // decide its entrance stagger and whether its image is fetched with priority,
  // so a running offset keeps both behaving exactly as they did when this was a
  // single grid — five sections don't become five sets of priority images.
  const startIndexes = groups.reduce<number[]>((acc, group, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + groups[i - 1].products.length);
    return acc;
  }, []);

  return (
    // Falls back to the label, so the landmark is still named for a screen
    // reader on a mode whose feed leads with its label alone.
    <section aria-label={productFeed.section.title ?? productFeed.section.label} className="py-16 md:py-20">
      <div className="mx-auto max-w-[1440px] px-4 md:px-12">
        <ModeFade mode={mode}>
          <SectionHeader
            title={productFeed.section.title}
            label={productFeed.section.label}
            subtitle={productFeed.section.subtitle}
            actionButton={
              <SortDropdown options={options} value={sort} onChange={setSort} size="sm" />
            }
          />

          {/* One continuous shopping run: a category is separated by enough space
              to read as its own block, not by enough to feel like a new page.
              14 / 16 between strips against the 20 / 24 under each heading keeps
              every heading closer to its own products than to the strip above. */}
          <div className="flex flex-col gap-14 md:gap-16">
            {groups.map(({ section, products: items }, i) => (
              <ProductCategorySection
                key={section.id}
                id={section.id}
                title={section.title}
                products={items}
                rows={section.rows}
                user={user}
                startIndex={startIndexes[i]}
              />
            ))}
          </div>
        </ModeFade>
      </div>
    </section>
  );
}
