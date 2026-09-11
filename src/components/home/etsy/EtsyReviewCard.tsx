"use client";

import Image from 'next/image';
import Stars from '@/components/home/etsy/Stars';
import { EtsyIcon } from '@/components/icons/BrandGlyphs';
import type { EtsyReview, EtsyStats } from '@/data/brand';

/**
 * One real Etsy review, presented in UNRWLY's design system.
 *
 * ── THE POINT: CONTEXT, NOT A QUOTE ──────────────────────────────────────────
 * The previous version was a large pull quote with "Verified Etsy customer"
 * under it. It looked good and proved nothing — a quote with no context is
 * indistinguishable from copywriting, and a visitor asking "is this a real
 * business?" is exactly the visitor who discounts it.
 *
 * So the card follows the chain a marketplace review actually carries, because
 * that chain is the evidence:
 *
 *     who → when → how many stars → what they said → what they bought
 *
 * "Michaela, Jun 11 2026, five stars, on the Oui Mais Non Weekender Bag" is a
 * claim someone can go and check. That is the whole design brief.
 *
 * ── NOT AN ETSY EMBED ────────────────────────────────────────────────────────
 * The information hierarchy is borrowed; none of the styling is. Card, border,
 * radius, type steps and accent are the site's own, so the block reads as UNRWLY
 * talking about its Etsy history rather than as a widget pasted in from
 * somewhere else. There is no Etsy logotype, no marketplace orange, no fake
 * badge — one small mark and the word "Etsy" is enough to name the source.
 *
 * ── EVERY OPTIONAL FIELD DEGRADES ────────────────────────────────────────────
 * Reviewer, date, item and customer photo each render only when genuinely
 * recorded. A review missing its reviewer shows "Verified Etsy customer" and one
 * line fewer; it never shows an invented name, and the layout does not leave a
 * hole where the missing piece would have been.
 */
export default function EtsyReviewCard({
  review,
  stats,
  shopName,
}: {
  review: EtsyReview;
  stats: EtsyStats;
  shopName: string;
}) {
  const { author, date, rating, quote, product, customerPhoto, sellerResponse } = review;

  return (
    /* The card is its own container, so the split below is decided by how wide
       THIS CARD actually is rather than by how wide the window is. It used to
       live in a full-width section, where `lg:` meant "there is room"; it now
       sits in a roughly half-width column, where the same viewport width means
       the opposite. Querying its own box gets both placements right, and a card
       rendered with no container ancestor simply stays stacked. Padding, border,
       radius and background are untouched — the grid moved inside them. */
    <article className="@container rounded-panel border border-[#EAE6DF] bg-white p-5 md:p-6">
      {/* Summary | review, with the rule between them.
       *
       * The threshold is the narrowest card width at which the review still
       * reads — below 28rem the quote would be squeezed under about 24
       * characters a line, so the two halves stack instead and the vertical
       * rule becomes a horizontal one (see the summary's border classes).
       *
       * `minmax(136px, …)` rather than a bare fraction: the summary holds a
       * fixed set of things, and the binding one is the star row — five 14px
       * glyphs plus their gaps is 78px, so 136px keeps it on one line with room
       * for the caption beneath. Stars wrapping is the one thing in here that
       * must never happen, and a proportional column alone would allow it in
       * this half-width placement. Both numbers move with the type scale. */}
      <div className="grid gap-6 @md:gap-8 @md:grid-cols-[minmax(136px,184px)_minmax(0,1fr)]">
        {/* ── SUMMARY ──────────────────────────────────────────────────────────
            The aggregate, stated the way the marketplace states it: the score, the
            count it is averaged over, and what it is an average OF. "5.0 (8)" is
            more honest than a bare 5.0 — it says up front that this is a small
            shop with a perfect record, not a big one with a suspicious one.

            This is now the ONLY place the shop's figures are stated. The Etsy
            record's four-card statistics grid used to repeat all of them beside
            this card; it has gone, and these read as the context around a real
            review rather than as a scoreboard of their own. */}
        <div className="flex flex-col justify-center border-b border-[#EAE6DF] pb-6 @md:border-b-0 @md:border-r @md:pb-0 @md:pr-6">
          <div className="flex items-baseline gap-2">
            <span className="type-stat text-[32px] text-ink">{stats.rating.toFixed(1)}</span>
            <span className="type-label text-neutral-400">({stats.reviewCount})</span>
          </div>
          <Stars rating={stats.rating} size={14} className="mt-2.5" />
          <p className="type-label mt-2.5 text-neutral-500">Average item review</p>

          <p className="type-caption mt-4 border-t border-[#EAE6DF] pt-4 text-neutral-500">
            {stats.sales} sales · {stats.tenure.value} {stats.tenure.unit.toLowerCase()} on Etsy
          </p>
        </div>

        {/* ── THE REVIEW ───────────────────────────────────────────────────── */}
        <div className="flex flex-col">
          {/* who · when — first, because it is what makes the rest count */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="type-product-name text-[14px] text-ink">
              {author ?? 'Verified Etsy customer'}
            </span>
            {date && <span className="type-caption text-neutral-400">{date}</span>}
          </div>

          <Stars rating={rating} size={15} className="mt-2.5" />

          {/* `.type-review` — the review-body step (17→20px, UI face, regular
              weight). Deliberately quieter than the section heading above and the
              `5.0` beside it: this is a customer talking, and it only has to be
              legible, not loud.

              The 620px measure is ~62 characters at this size — the readable
              range for a paragraph. No clamping and no truncation: the whole
              review is always shown, however long it runs. */}
          <blockquote className="type-review mt-3 max-w-[720px] text-[16px] text-ink">
            <p>“{quote}”</p>
          </blockquote>

          {/* the shop's own reply, where it left one — two people, not a billboard */}
          {sellerResponse && (
            <p className="type-body mt-4 border-l-2 border-accent pl-3.5 text-[14px] text-neutral-500">
              <span className="type-label mb-1 block text-neutral-500">
                {shopName} replied
              </span>
              {sellerResponse}
            </p>
          )}

          {/* ── WHAT THEY BOUGHT · THEIR PHOTO · WHERE IT CAME FROM ───────────
              Below a rule, the way a receipt sits below a note. The item and the
              photo are each optional; the provenance is not, so this row always
              renders — naming the source is the part that makes the review
              checkable, and it has to hold whether or not we know what was
              bought. A plain top margin rather than `mt-auto`: the quotes here run
              from five words to forty, and pinning the rule to the bottom of the
              card would leave a short review with a lake of white space above its
              own receipt. */}
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-[#EAE6DF] pt-5">
            {product && (
              <div className="flex min-w-0 items-center gap-3">
                {product.image && (
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-card bg-[#F5F5F2]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="type-label block text-neutral-400">Purchased</span>
                  {product.href ? (
                    <a
                      href={product.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="type-product-name mt-1 block text-[13px] text-ink underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    >
                      {product.name}
                    </a>
                  ) : (
                    <span className="type-product-name mt-1 block text-[13px] text-ink">
                      {product.name}
                    </span>
                  )}
                </span>
              </div>
            )}

            {customerPhoto && (
              <div className="flex items-center gap-3">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-card bg-[#F5F5F2]">
                  <Image
                    src={customerPhoto.src}
                    alt={customerPhoto.alt}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </span>
                <span className="type-label text-neutral-400">Customer photo</span>
              </div>
            )}

            {/* Provenance, stated once and quietly. */}
            <span className="type-label ml-auto flex items-center gap-2 text-neutral-400">
              <EtsyIcon size={14} className="text-accent-800" />
              Reviewed on Etsy
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
