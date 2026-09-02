/**
 * Brand presence content model — the proof that UNRWLY is a real, trading shop.
 *
 * The homepage's trust surfaces (Etsy legacy stats, customer reviews, social
 * links) all read from ONE per-mode bundle so Adult figures can never appear
 * while the Kids store is selected, and vice versa. Adding a third mode later is
 * one more entry in `presence.ts` — no component changes.
 *
 * ── EVERYTHING HERE IS REAL ──────────────────────────────────────────────────
 * Ratings, review counts, sales and tenure are transcribed from the live Etsy
 * shops, and review quotes are the customers' own words. Nothing in this file may
 * be estimated, rounded up, or written to fill a layout: a fabricated number on a
 * page whose whole job is credibility is worse than no number at all. Every
 * optional field below exists so a section can render honestly when the real
 * asset (a product shot, a customer photo, a date) is not available yet.
 */

import type { HomepageMode } from '@/data/homepage/types';

/** The headline figures shown in the Etsy legacy strip. */
export interface EtsyStats {
  /** Average review score, e.g. 5.0. */
  rating: number;
  /** Number of reviews the shop has received. */
  reviewCount: number;
  /** Lifetime sales. */
  sales: number;
  /**
   * How long the shop has been trading, split so the figure and its unit can be
   * typeset separately — "2.5" large, "Years" small. Deliberately a string:
   * the two shops are measured in different units (years vs months) and the
   * value is transcribed, not computed, so it can never drift from Etsy.
   */
  tenure: { value: string; unit: string };
}

/** The item a review is attached to, as Etsy shows beneath the review text. */
export interface ReviewedProduct {
  /** Listing title, exactly as it reads on Etsy. */
  name: string;
  /** Listing thumbnail (see public/etsy/README.md). Omit if unavailable. */
  image?: string;
  /** Direct link to the listing. Omit → the name renders as plain text. */
  href?: string;
}

/** A photo the customer attached to their own review. Never a stock image. */
export interface CustomerPhoto {
  src: string;
  /** Required — describes what the customer photographed. */
  alt: string;
}

/**
 * One real customer review, as published on the shop's Etsy page.
 *
 * ── WHY SO MANY OPTIONAL FIELDS ──────────────────────────────────────────────
 * Etsy shows a review as: who · when · stars · text · what they bought · (their
 * photo). That whole chain is what makes a review believable — a quote on its
 * own could have been written by anyone, while "Michaela, Jun 11 2026, on the
 * Oui Mais Non Weekender Bag" is checkable in one click.
 *
 * So the shape mirrors Etsy's, but only `quote` and `rating` are required,
 * because those are the only two we can always source truthfully. Every other
 * field is filled in ONLY where it is genuinely known and rendered ONLY when
 * present. A review missing its reviewer's name shows fewer lines; it never
 * shows an invented one. Filling the gaps is a matter of transcribing them from
 * the live shop into `presence.ts` — see the note at the top of this file.
 */
export interface EtsyReview {
  /** Stable key. */
  id: string;
  /** The review text, verbatim. */
  quote: string;
  /** Stars given, out of 5. */
  rating: number;
  /** Reviewer's display name, exactly as Etsy shows it. Omit if unknown. */
  author?: string;
  /** Review date as published, e.g. "Jun 11, 2026". Omit if unknown. */
  date?: string;
  /** The item reviewed. Omit if unknown. */
  product?: ReviewedProduct;
  /** A photo the customer attached to the review. Omit if there isn't one. */
  customerPhoto?: CustomerPhoto;
  /**
   * The shop's public reply, if it left one. Etsy shows these under the review
   * and they are part of what makes the exchange read as a real transaction
   * between two people.
   */
  sellerResponse?: string;
}

/** One outbound social/marketplace profile. */
export interface SocialProfile {
  /** Stable key, also the icon lookup — see `SocialLinks`. */
  id: 'etsy' | 'pinterest' | 'facebook' | 'instagram';
  /** Accessible name, e.g. "UNRWLY on Etsy". */
  label: string;
  href: string;
}

/** Everything one storefront mode contributes to the trust surfaces. */
export interface BrandPresence {
  mode: HomepageMode;
  /** Shop name as it reads on Etsy, e.g. "Unrwly" / "UNRWLYkids". */
  shopName: string;
  /** Canonical shop URL — every Etsy CTA in this mode points here. */
  etsyUrl: string;
  /**
   * Where "View more reviews on Etsy" goes. Usually the shop URL with Etsy's
   * reviews anchor, so the visitor lands on the reviews rather than on the
   * listings and has to go looking for them — the whole point of the link is
   * that the claim can be checked immediately.
   */
  reviewsUrl: string;
  stats: EtsyStats;
  /**
   * Reviews in DISPLAY order — the most completely attributed first, since that
   * is the one the section features. Never longer than `stats.reviewCount`.
   */
  reviews: EtsyReview[];
  /** Profiles shown in the trust strip and the footer, in display order. */
  socials: SocialProfile[];
  /** Copy for the Etsy legacy strip. */
  legacy: {
    label: string;
    title: string;
    body: string;
    ctaLabel: string;
  };
  /** Copy for the review section. */
  reviewSection: {
    label: string;
    title: string;
    subtitle: string;
    /** Etsy's own wording for the aggregate, kept because it is precise. */
    summaryLabel: string;
    ctaLabel: string;
  };
  /** Copy for the Follow UNRWLY block. */
  follow: {
    title: string;
    subtitle: string;
  };
}
