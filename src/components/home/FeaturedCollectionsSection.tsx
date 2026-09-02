"use client";

import CollectionCardRail from '@/components/CollectionCardRail';
import ModeFade from '@/components/home/ModeFade';
import { useHomepageContent } from '@/store/useHomepageMode';

/**
 * The three promotional windows, directly below the welcome block.
 *
 * This is the old Shop by Category section, refocused. The card layout works, so
 * it is untouched — same size, same overlay, same hover, same button, same
 * animations. One of the three now plays the shop's film instead of holding a
 * still (see `videoSlot` in `data/homepage/types.ts`), which is where the
 * full-viewport hero video went; it changes nothing about the card's dimensions
 * or chrome, so the three windows still carry equal visual weight. What else
 * changed is what the cards point at: the shop's own
 * collections (Sale, Bestsellers, Seasonal, or any Etsy edit) instead of broad
 * Men / Women / Unisex categories, and the "Shop by Category" heading is gone
 * entirely. Three promoted collections need no label to explain them, and
 * dropping the rail puts products a full section closer to the fold.
 *
 * Which collections appear is per-mode data (`featuredCollections` in
 * `adultHomepage.ts` / `kidsHomepage.ts`), resolved from the shared registry in
 * `data/homepage/collections.ts` — so re-merchandising, or wiring this to a CMS,
 * never touches this component.
 *
 * The fade wraps the whole `<section>`. The homepage's root is a plain
 * `flex flex-col` with no `gap`, so a full-width block wrapper around a section
 * is layout-neutral: the section keeps its own vertical rhythm and measures
 * exactly as it did before.
 */
export default function FeaturedCollectionsSection({
  videoUrls,
}: {
  /**
   * The shop's film, from the admin StoreConfig. It plays inside whichever of
   * the three cards is marked `videoSlot` — this is where the old full-viewport
   * hero video went. Nothing configured → that card renders as a still and the
   * row is three ordinary windows.
   */
  videoUrls?: string[] | null;
}) {
  const { mode, featuredCollections } = useHomepageContent();

  if (!featuredCollections.length) return null;

  return (
    <ModeFade mode={mode}>
      {/* Sits tighter to the welcome block than to the feed below it: the cards
          read as the intro's continuation, and the extra space underneath marks
          the handover to products. */}
      <section aria-label="Featured collections" className="pt-4 pb-16 md:pt-6 md:pb-20">
        <div className="mx-auto max-w-[1440px] px-4 md:px-12">
          <CollectionCardRail items={featuredCollections} videoUrls={videoUrls ?? undefined} />
        </div>
      </section>
    </ModeFade>
  );
}
