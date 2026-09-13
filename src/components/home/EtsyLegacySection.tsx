"use client";

import { ArrowUpRight } from 'lucide-react';
import ModeFade from '@/components/home/ModeFade';
import EtsyReviewsPanel from '@/components/home/etsy/EtsyReviewsPanel';
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
 * gone and the reviews have taken its place inside this section (see
 * `EtsyReviewsPanel`), so the claim and the evidence are read together.
 *
 * The figures were not lost with the grid — the review block carries them in
 * its own summary column, where they read as the context around a real customer
 * rather than as a scoreboard. They are now stated exactly once on the page.
 *
 * ── MASTHEAD, THEN EVIDENCE ────────────────────────────────────────────────
 * Two rows, not two columns. The heading and the Etsy button share a masthead
 * row; the review card spans the full panel beneath it.
 *
 * It was a two-column grid, and that is what produced the section's long-
 * standing empty patch: a grid column is as tall as its row, so a 54px button
 * reserved a full-height track beside a 600px card and left the remainder
 * blank. Narrowing the track only narrowed the void. Making the CTA a row-mate
 * of the heading instead of a column of its own removes it entirely, and hands
 * the card the whole container rather than whatever a sibling track left over.
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
          <div className="rounded-panel border border-[#EAE6DF] bg-[#FCFCFA] px-6 py-12 md:px-12 md:py-16">
            {/* ── MASTHEAD ROW: the claim on the left, the action on the right ──
                This was a two-COLUMN grid — heading and review card stacked in
                one column, CTA in the other — and that structure is what forced
                the awkward space. A column has to be as tall as the row, so a
                54px button reserved a full-height track beside a 600px card and
                left the rest of it blank. Narrowing the track only made the void
                narrower; it could not remove it.

                So the CTA is no longer a column. It is one half of a masthead
                row that ends where the heading ends, and the review card below
                spans the whole panel. Nothing reserves vertical space it does
                not use, and the card gets every pixel of the container instead
                of whatever a sibling track left over.

                `items-start` keeps the button level with the eyebrow rather than
                centred against the heading block. Below `sm` the row stacks and
                the CTA sits under the heading, left-aligned like everything
                else. */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
              <div className="min-w-0">
                {/* Names the source before the numbers. The Etsy "E" that sat
                    here is gone, struck through in the notes, along with the one
                    on the button — the words still say Etsy. */}
                <p className="type-label text-neutral-500">{legacy.label}</p>

                <h2 style={{ color: 'var(--color-ink)' }} className="type-section-title mt-4">
                  {legacy.title}
                </h2>
              </div>

              {/* The button and its destination line are one CTA group: `mt-2`
                  rather than `mt-3` between them, and both right-aligned from
                  `sm` up so they read as a single block pinned to the corner. */}
              <div className="flex shrink-0 flex-col sm:items-end">
                <a
                  href={etsyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${legacy.ctaLabel} — opens etsy.com/shop/${shopName} in a new tab`}
                  className="type-button group inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-accent px-8 sm:w-auto text-[13px] uppercase leading-none tracking-[0.12em] text-accent-on shadow-[0_10px_24px_-12px_rgb(var(--accent-ring-rgb)/0.6)] transition-[transform,background-color,box-shadow] duration-[250ms] ease-out hover:-translate-y-0.5 hover:bg-accent-950 hover:text-accent-on-strong hover:shadow-[0_16px_30px_-12px_rgb(var(--accent-ring-rgb)/0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
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
                <p className="type-caption mt-2 text-[11px] uppercase leading-[1.3] tracking-[0.15em] text-neutral-400 sm:text-right">
                  Opens etsy.com/shop/{shopName} in a new tab
                </p>
              </div>
            </div>

            {/* ── THE EVIDENCE, FULL WIDTH ──────────────────────────────────
                The review card, its metadata line and its paging controls now
                have the entire panel to work with — roughly 1248px at 1440
                rather than the ~900px a sibling column left them. The panel
                itself is unchanged: same border, radius, ground and padding. */}
            {hasReviews && (
              <div className="mt-10">
                <EtsyReviewsPanel />
              </div>
            )}
          </div>
        </div>
      </section>
    </ModeFade>
  );
}
