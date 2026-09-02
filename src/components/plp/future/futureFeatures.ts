/**
 * Feature flags for the roadmap components in this folder.
 *
 * Every component beside this file is a real, self-contained placeholder: it
 * renders its own entry point in the site's existing language and stops short of
 * the logic it would need (a size algorithm, a bundle builder, a quiz engine, a
 * recommendation query). They are wired into the pages already, behind these
 * flags, so shipping one is flipping a boolean here — not an integration job.
 *
 * All flags are OFF, so the PLP renders today exactly as specified with nothing
 * extra on the page.
 */
export const FUTURE_FEATURES = {
  /** Kids PLP: "How old is your child?" → recommended size. */
  sizeAgePredictor: false,
  /** Kids PLP: build a matching set across adult + kids sizes. */
  familyMatchingBundle: false,
  /** PLP: entry point to a guided gift quiz. */
  giftFinder: false,
  /** PLP + PDP: the shopper's recently viewed products. */
  recentlyViewed: false,
  /** PDP: "Customers Also Bought" recommendation rail. */
  customersAlsoBought: false,
  /** Wishlist: notify me when a size is back. See `useSizeAlerts`. */
  wishlistSizeAlerts: false,
} as const;

export type FutureFeature = keyof typeof FUTURE_FEATURES;
