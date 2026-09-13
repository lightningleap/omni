"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EtsyReviewCard from '@/components/home/etsy/EtsyReviewCard';
import { useBrandPresence } from '@/store/useHomepageMode';

/**
 * "Loved on Etsy" — the shop's customers in their own words.
 *
 * ── WHY THIS IS A PANEL AND NOT A SECTION ───────────────────────────────────
 * This was a full-width section of its own, sitting directly under the Etsy
 * record, and the two made the same argument twice: the record stated the
 * rating, the review count, the sales and the tenure in a four-card grid, and
 * the reviews restated all four a screen later. They are now one section — the
 * record's claim on the left, the customers who back it on the right. The stat
 * grid is gone; the figures survive where they read as evidence rather than as
 * a scoreboard, in this block's own summary column.
 *
 * Everything below is the section as it was: same label, title and subtitle,
 * same paging arrows, the same `EtsyReviewCard` with its summary column, the
 * same provenance line and the same link out to the live reviews. It lost its
 * `<section>` wrapper, its page container and its `ModeFade` — the section it
 * now lives inside owns all three.
 *
 * ── SIZED BY ITS COLUMN, NOT BY THE WINDOW ──────────────────────────────────
 * The panel is roughly half-width on a desktop and full-width once the section
 * stacks, and those are opposite layout problems at the SAME viewport size. So
 * the two rows that can go horizontal (the heading against its arrows, the
 * provenance line against its button) break on `@container` queries — they read
 * the width of this column rather than the width of the screen, and so lay
 * themselves out correctly in either position without either one knowing where
 * it has been placed. The card inside does the same with its summary column.
 *
 * ── NAVIGATION EXISTS ONLY WHEN THERE IS SOMETHING TO NAVIGATE ──────────────
 * The Kids shop has exactly one review today. It renders as one review — no
 * arrows, no counter, no duplicated slides padded out to look busier. A shop
 * that is honestly new reads better than one pretending otherwise, and a
 * carousel of a single repeated card is precisely the detail a sceptical
 * visitor notices.
 *
 * ── MODE-AWARE BY CONSTRUCTION ──────────────────────────────────────────────
 * Reviews, figures, shop name and both links come from the active mode's bundle
 * (`data/brand/presence.ts`), so Adult's reviews can never appear while Kids is
 * selected. This component never branches on the audience itself.
 */
export default function EtsyReviewsPanel() {
  const { reviews, stats, shopName } = useBrandPresence();

  const [index, setIndex] = useState(0);

  if (!reviews.length) return null;

  const many = reviews.length > 1;
  // Wrapped rather than clamped: the two shops have different numbers of
  // reviews, and this component sits ABOVE the mode crossfade, so its index
  // survives a switch from Adult's five to Kids' one. The modulo makes any stale
  // index land somewhere valid instead of reading past the array.
  const safeIndex = index % reviews.length;
  const review = reviews[safeIndex];
  const step = (dir: 1 | -1) =>
    setIndex((i) => ((i % reviews.length) + dir + reviews.length) % reviews.length);

  const arrow =
    'flex h-9 w-9 items-center justify-center rounded-full border border-[#EAE6DF] bg-white text-accent-800 transition-[background-color,color,transform] duration-200 ease-out hover:bg-accent hover:text-accent-on active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2';

  return (
    <section aria-label="Customer reviews from Etsy" className="@container">
      {/* Keyed so paging remounts the card: assistive tech re-announces the
          incoming review rather than reading a half-swapped one. */}
      <EtsyReviewCard key={review.id} review={review} stats={stats} shopName={shopName} />

      <div className="mt-4 flex flex-col gap-3 @lg:flex-row @lg:items-center @lg:justify-between">
        {/* States what is actually on screen against what the shop actually
            has. A shop with one review says "1 review on Etsy" rather than
            borrowing a carousel's "1 of 5" — and where fewer reviews are
            recorded here than the shop has published, it says "showing 3 of
            8" rather than implying 3 is all there is. Both readings are
            true at a glance, which is the entire currency of this section. */}
        <p className="type-caption text-neutral-500">
          {stats.reviewCount === 1
            ? `1 review on Etsy · etsy.com/shop/${shopName}`
            : many
              ? `Showing ${safeIndex + 1} of ${reviews.length} · ${stats.reviewCount} reviews on etsy.com/shop/${shopName}`
              : `${stats.reviewCount} reviews on etsy.com/shop/${shopName}`}
        </p>

        {/* Paging sits opposite the count, which is the line that says which
            review you are on — the control and its readout on one row. It used
            to sit above the card opposite the panel's heading; that heading is
            gone, and leaving the arrows up there left them floating over an
            empty row. Only rendered when there is more than one review. */}
        {many && (
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => step(-1)} aria-label="Previous review" className={arrow}>
              <ChevronLeft size={17} strokeWidth={2.25} />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next review" className={arrow}>
              <ChevronRight size={17} strokeWidth={2.25} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
