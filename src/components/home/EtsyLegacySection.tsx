"use client";

import { ArrowUpRight } from 'lucide-react';
import ModeFade from '@/components/home/ModeFade';
import EtsyReviewsPanel from '@/components/home/etsy/EtsyReviewsPanel';
import { EtsyIcon } from '@/components/icons/BrandGlyphs';
import { useBrandPresence, useHomepageMode } from '@/store/useHomepageMode';

/**
 * The Etsy legacy strip — this shop's trading record, stated plainly.
 *
 * WHAT IT IS FOR
 * UNRWLY is one person drawing designs, and the internet is currently full of
 * storefronts that look exactly like an independent label until you order from
 * one. This section is the difference, and it makes the case the only way that
 * actually lands: with the receipts. A rating, a review count, a sales figure
 * and a tenure — all real, all checkable in one click on the shop itself.
 *
 * WHAT IT DELIBERATELY IS NOT
 * It never says what UNRWLY isn't. No "not AI generated", no "not a
 * drop-shipper", no shield badges or invented "verified" seals. A brand that
 * protests is a brand you start wondering about; a brand that shows you its Etsy
 * page and its 54 orders has already answered the question. Everything here is
 * positive proof.
 *
 * ── ONE SECTION, TWO COLUMNS ────────────────────────────────────────────────
 * "Loved on Etsy" used to be a full-width section of its own directly below
 * this one, and the two argued the same point twice: this side stated the
 * rating, the review count, the sales and the tenure in a four-card statistics
 * grid, and the reviews restated all four a screen further down. The grid is
 * gone and the reviews have taken its place in the right-hand column (see
 * `EtsyReviewsPanel`), so the claim and the evidence are read together.
 *
 * The figures were not lost with the grid — the review block carries them in
 * its own summary column, where they read as the context around a real customer
 * rather than as a scoreboard. They are now stated exactly once on the page.
 *
 * Nothing about THIS column changed: the eyebrow, the heading, the paragraph,
 * the button and the line naming where the button goes are as they were.
 *
 * MODE-AWARE BY CONSTRUCTION
 * The copy, the reviews and every link come from the active mode's bundle
 * (`data/brand/presence.ts`), so Adult's record can never appear while the Kids
 * store is selected — the component itself never branches on the audience.
 */
export default function EtsyLegacySection() {
  const { mode } = useHomepageMode();
  const { reviews, legacy, etsyUrl, shopName } = useBrandPresence();

  // A mode with no reviews yet gets the copy at full width rather than a column
  // of empty space beside it. Kids has one review; a third mode might have none.
  const hasReviews = reviews.length > 0;

  return (
    <ModeFade mode={mode}>
      <section aria-label="UNRWLY on Etsy" className="py-16 md:py-20">
        <div className="mx-auto max-w-[1440px] px-4 md:px-12">
          <div className="rounded-[8px] border border-[#EAE6DF] bg-[#FCFCFA] px-6 py-12 md:px-12 md:py-16">
            {/* Tops aligned, not centred. The right column used to be a short
                statistics grid, which floated badly against a wall of text and
                so was centred; the review block that replaced it is the taller
                of the two, and centring the copy against it would leave it
                drifting in the middle of the card. Sharing a top edge lands the
                two eyebrow labels and the two headings on the same baselines,
                which is what makes the halves read as one section.

                The reviews take the NARROWER column (1 against 1.1). Width here
                is the only place the review block's width can come from — it
                fills whatever column it is given — so making it more compact
                means giving it less. At 1440 that is a ~565px column, which
                still leaves its card comfortably above the 28rem it needs to
                keep the summary and the review side by side. The copy on the
                left simply gets the space back; none of its content, type or
                spacing changed. */}
            <div
              className={`grid gap-10 lg:gap-16 ${
                hasReviews ? 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start' : ''
              }`}
            >
              {/* Left — the claim */}
              <div>
                {/* Names the source in the eyebrow, so "Etsy" is established
                    before the numbers rather than only at the button. */}
                <p className="type-label flex items-center gap-2.5 text-neutral-500">
                  <EtsyIcon size={16} className="text-accent-800" />
                  {legacy.label}
                </p>

                <h2 style={{ color: '#1A1A1A' }} className="type-section-title mt-4">
                  {legacy.title}
                </h2>

                <p className="type-body mt-5 max-w-[620px] text-[15px] text-[#334155] md:text-base">
                  {legacy.body}
                </p>

                {/* The CTA and its destination line are one unit, tight to each
                    other and clearly separated from the paragraph above. */}
                <div className="mt-8">
                  <a
                    href={etsyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${legacy.ctaLabel} — opens etsy.com/shop/${shopName} in a new tab`}
                    className="type-button group inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-accent px-8 text-[13px] uppercase leading-none tracking-[0.12em] text-accent-on shadow-[0_10px_24px_-12px_rgb(var(--accent-ring-rgb)/0.6)] transition-[transform,background-color,box-shadow] duration-[250ms] ease-out hover:-translate-y-0.5 hover:bg-accent-950 hover:text-accent-on-strong hover:shadow-[0_16px_30px_-12px_rgb(var(--accent-ring-rgb)/0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto"
                  >
                    <EtsyIcon size={17} />
                    {legacy.ctaLabel}
                    <ArrowUpRight
                      size={17}
                      strokeWidth={2}
                      className="transition-transform duration-[250ms] ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                    />
                  </a>

                  {/* Says out loud where the link goes and that it leaves the
                      site — an accessibility nicety, and part of the point: the
                      shop is happy to hand you off to be checked. */}
                  <p className="type-caption mt-3 text-[11px] uppercase leading-[1.3] tracking-[0.15em] text-neutral-400">
                    Opens etsy.com/shop/{shopName} in a new tab
                  </p>
                </div>
              </div>

              {/* Right — the receipts, in the customers' own words. This was a
                  2×2 grid of figures (rating, reviews, sales, tenure); it is
                  now the "Loved on Etsy" block that used to sit below, moved
                  across whole and unredesigned. It sizes itself to this column
                  rather than to the window — see `EtsyReviewsPanel`. */}
              {hasReviews && <EtsyReviewsPanel />}
            </div>
          </div>
        </div>
      </section>
    </ModeFade>
  );
}
