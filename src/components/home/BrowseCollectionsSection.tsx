"use client";

import CategoryCircleGrid from '@/components/CategoryCircleGrid';
import SectionHeader from '@/components/SectionHeader';
import ModeFade from '@/components/home/ModeFade';
import { useHomepageContent } from '@/store/useHomepageMode';

/**
 * Browse Collections — the circular category navigator.
 *
 * This section used to be shared between the two storefronts, which meant a
 * parent shopping the Kids store was offered "Witchy & Gothic" and "Feminist &
 * Unfiltered". The rail itself, its heading and its interactions are unchanged;
 * what changed is that the categories now come from the ACTIVE MODE, so Adult
 * shows the Adult Etsy sections and Kids shows Dinosaur World, Capybara Club and
 * the rest. Neither audience can see the other's.
 *
 * `imageOverrides` lets the studio replace a placeholder thumbnail simply by
 * saving a file — the server checks `public/categories/` for one named after the
 * category and passes it in (see `getCategoryImages` in `app/page.tsx`). Nothing
 * here knows or cares which images are real.
 */
export default function BrowseCollectionsSection({
  imageOverrides,
}: {
  imageOverrides?: Record<string, string>;
}) {
  const { mode, browseCollections } = useHomepageContent();

  if (!browseCollections.items.length) return null;

  const items = imageOverrides
    ? browseCollections.items.map((item) => {
        const override = imageOverrides[`${mode}-${item.id}`];
        return override ? { ...item, imageUrl: override } : item;
      })
    : browseCollections.items;

  return (
    <ModeFade mode={mode}>
      <section aria-label={browseCollections.section.title} className="py-12">
        <div className="mx-auto max-w-[1440px] px-4 md:px-12">
          <SectionHeader
            title={browseCollections.section.title}
            subtitle={browseCollections.section.subtitle}
          />

          {/* The active mode travels with every link. The collection page has
              to default a missing `audience` to Adult (an unscoped grid would
              paint toddler tees under an Adult toggle), so a Kids circle that
              omitted it was asking the Adult catalogue for Dinosaur World. */}
          <CategoryCircleGrid collections={items} audience={mode} />
        </div>
      </section>
    </ModeFade>
  );
}
