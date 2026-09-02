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
      subtitle: 'Every UNRWLY edit, from statement prints to the everyday essentials.',
    },
    items: [
      {
        id: 'all',
        name: 'All',
        handle: 'all',
        imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80',
      },
      {
        id: 'on-sale',
        name: 'On Sale',
        handle: 'sale',
        imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=80',
      },
      {
        id: 'french-with-attitude',
        name: 'French with Attitude',
        handle: 'french-with-attitude',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
      },
      {
        id: 'vintage-botanical',
        name: 'Vintage Botanical',
        handle: 'vintage-botanical',
        imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
      },
      {
        id: 'wildlife-and-oddities',
        name: 'Wildlife & Oddities',
        handle: 'wildlife-and-oddities',
        imageUrl: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=400&q=80',
      },
      {
        id: 'feminist-and-unfiltered',
        name: 'Feminist & Unfiltered',
        handle: 'feminist-and-unfiltered',
        imageUrl: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&q=80',
      },
      {
        id: 'witchy-and-gothic',
        name: 'Witchy & Gothic',
        handle: 'witchy-and-gothic',
        imageUrl: 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=400&q=80',
      },
      {
        id: 'self-love-statements',
        name: 'Self-Love Statements',
        handle: 'self-love-statements',
        imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=80',
      },
      {
        id: 'totes-and-travel-bags',
        name: 'Totes & Travel Bags',
        handle: 'totes-and-travel-bags',
        imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80',
      },
      {
        id: 'mugs-and-drinkware',
        name: 'Mugs & Drinkware',
        handle: 'mugs-and-drinkware',
        imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80',
      },
      {
        id: 'hats-and-accessories',
        name: 'Hats & Accessories',
        handle: 'hats-and-accessories',
        imageUrl: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400&q=80',
      },
      {
        id: 'home-and-desk',
        name: 'Home & Desk',
        handle: 'home-and-desk',
        imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
      },
    ],
  },

  // ── MAIN PRODUCT FEED ───────────────────────────────────────────────────
  productFeed: {
    section: {
      label: 'The Collection',
      title: 'Fresh From the Studio',
      subtitle: 'Every piece printed to order, packed by hand, and sent from our small studio.',
    },
  },

  // ── NAVIGATION ──────────────────────────────────────────────────────────
  nav: [
    { label: 'Men', href: '/shop/men' },
    { label: 'Women', href: '/shop/women' },
    { label: 'Kids', href: '/shop/kids' },
  ],
};
