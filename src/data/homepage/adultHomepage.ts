import { pickCollections } from './collections';
import type { HomepageContent } from './types';

/**
 * ADULT mode — the default storefront.
 *
 * Edit this file to re-merchandise the Adult homepage. No component changes.
 *
 * Everything here speaks to the grown-up shop: the categories mirror the Adult
 * Etsy sections (French with Attitude, Witchy & Gothic, Feminist & Unfiltered…)
 * so a customer arriving from a listing lands somewhere they recognise, and no
 * children's merchandising appears anywhere on the page.
 */
export const adultHomepage: HomepageContent = {
  mode: 'adult',
  label: 'Adult',

  // ── WELCOME / BRAND INTRO ───────────────────────────────────────────────
  // Compact by design — this replaced a full-viewport video banner. It says who
  // makes this and how, then gets out of the way: one route into the catalogue,
  // one into the founder's story for anyone asking "who is actually behind this?"
  welcome: {
    badge: 'Independent Studio · Drawn by Hand',
    // No `title`. The brand plate directly above this section is the UNRWLY
    // lockup, so printing the wordmark again immediately beneath it said the
    // same thing twice. The supporting line below is unchanged and now carries
    // the heading on its own.
    titleSupporting: 'Original Artwork, Worn Daily',
    // Three authored lines, rendered as three — see `whitespace-pre-line` in
    // WelcomeSection. They carry no joining punctuation, so as one flowing
    // paragraph the second and third would collide. Each still wraps normally
    // when the measure is narrower than the line.
    tagline:
      'Apparel for the delightfully unrwly, for everyday wear.\n' +
      'Hand drawn illustrations and original designs - no AI\n' +
      'Printed to order on premium materials.',
    cta: { label: 'Shop the Collection', href: '/collections/all?audience=adult' },
    secondaryCta: { label: 'Meet UNRWLY', href: '/meet-unrwly' },
  },

  // ── THREE PROMOTIONAL WINDOWS ───────────────────────────────────────────
  // Most loved · New (the film) · Fresh this month. The ids below are the slots;
  // the headings they carry live in `collections.ts`. The middle card is the
  // video slot — same size, same overlay, same button as its neighbours, so the
  // three read as one merchandising row rather than a banner with two friends.
  // Swap the ids to re-merchandise, e.g.
  //   pickCollections(['halloween', 'new-designs', 'funny-shirts'])
  featuredCollections: pickCollections(['bestsellers', 'new-designs', 'seasonal'], 'adult'),

  // ── BROWSE COLLECTIONS ──────────────────────────────────────────────────
  // The Adult Etsy shop's own sections, in its own words. Kids never sees these
  // (it has its own list) — that is the point of moving this out of `shared.ts`.
  //
  // IMAGERY: the `imageUrl`s below are on-brand PLACEHOLDERS. Drop the real Etsy
  // listing crop into `public/categories/adult-<id>.jpg` and it replaces the
  // placeholder automatically, no code change — see public/categories/README.md.
  browseCollections: {
    section: {
      title: 'Browse Collections',
    },
    // These are the collections that actually exist in the catalogue, with the
    // handles the database uses. The previous list was written by hand —
    // "Witchy & Gothic", "Mugs & Drinkware", "On Sale" — and none of those rows
    // were ever created, so all but one card led to a "Collection Coming Soon"
    // page. Anything added here has to match a real `Collection.handle`.
    items: [
      { id: 'all',            name: 'All',              handle: 'all' },
      { id: 'womens',         name: "Women's",          handle: 'women-s' },
      { id: 'mugs',           name: 'Mugs',             handle: 'mugs' },
      { id: 'bags',           name: 'Bags',             handle: 'bags' },
      { id: 'hats',           name: 'Hats',             handle: 'hats' },
      { id: 'stationery',     name: 'Stationery',       handle: 'stationery' },
      { id: 'home-decor',     name: 'Home Decor',       handle: 'home-decor' },
      { id: 'bottles',        name: 'Bottles',          handle: 'bottles' },
      { id: 'pillows',        name: 'Pillows & Covers', handle: 'pillows-covers' },
    ],
  },

  // ── MAIN PRODUCT FEED ───────────────────────────────────────────────────
  productFeed: {
    section: {
      title: 'Fresh From the Studio',
    },
  },

  // ── NAVIGATION ──────────────────────────────────────────────────────────
  nav: [
    { label: 'Men', href: '/shop/men' },
    { label: 'Women', href: '/shop/women' },
    { label: 'Kids', href: '/shop/kids' },
  ],
};
