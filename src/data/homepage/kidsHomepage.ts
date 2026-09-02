import { pickCollections } from './collections';
import type { HomepageContent } from './types';

/**
 * KIDS mode.
 *
 * Structurally identical to Adult by design — same sections, same order, same
 * components — so the two storefronts stay recognisably one brand and only the
 * merchandising differs. This is the ONLY file that needs editing to give Kids
 * its own identity: its own intro, its own three windows, its own categories,
 * its own feed copy.
 *
 * Nothing Adult appears here and nothing here appears in Adult. The categories
 * are the Kids Etsy shop's own sections (Dinosaur World, Capybara Club, Tiger
 * Tales…), which is what keeps the two audiences genuinely separate while they
 * share one design system.
 */
export const kidsHomepage: HomepageContent = {
  mode: 'kids',
  label: 'Kids',

  // ── WELCOME / BRAND INTRO ───────────────────────────────────────────────
  // Same compact treatment as Adult, in a register that speaks to a parent, and
  // leading with the thing that actually makes this shop different: nothing is
  // sorted into a boys' half and a girls' half.
  welcome: {
    badge: 'Independent Studio · Drawn by Hand',
    title: 'UNRWLY KIDS',
    titleSupporting: 'Little Originals',
    tagline: 'Original designs, hand-drawn and printed on high quality materials.',
    cta: { label: 'Shop the Collection', href: '/collections/all?audience=kids' },
    secondaryCta: { label: 'Meet UNRWLY', href: '/meet-unrwly' },
  },

  // ── THREE PROMOTIONAL WINDOWS ───────────────────────────────────────────
  // Same three-window layout as Adult, drawn from the same registry — the
  // `'kids'` argument scopes each link to the Kids cut of that collection. The
  // middle card is the video slot, matching Adult so the two modes stay in step.
  featuredCollections: pickCollections(['bestsellers', 'new-designs', 'back-to-school'], 'kids'),

  // ── BROWSE COLLECTIONS ──────────────────────────────────────────────────
  // The Kids Etsy shop's own sections. Adult never sees these.
  //
  // IMAGERY: the `imageUrl`s below are on-brand PLACEHOLDERS. Drop the real Etsy
  // listing crop into `public/categories/kids-<id>.jpg` and it replaces the
  // placeholder automatically, no code change — see public/categories/README.md.
  browseCollections: {
    section: {
      title: 'Browse Collections',
      subtitle: 'Characters, creatures and big ideas — every design made for every kid.',
    },
    items: [
      {
        id: 'all',
        name: 'All',
        handle: 'all',
        imageUrl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&q=80',
      },
      {
        id: 'dinosaur-world',
        name: 'Dinosaur World',
        handle: 'dinosaur-world',
        imageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&q=80',
      },
      {
        id: 'capybara-club',
        name: 'Capybara Club',
        handle: 'capybara-club',
        imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&q=80',
      },
      {
        id: 'cats-and-mischief',
        name: 'Cats & Mischief',
        handle: 'cats-and-mischief',
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80',
      },
      {
        id: 'imagination-and-positivity',
        name: 'Imagination & Positivity',
        handle: 'imagination-and-positivity',
        imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80',
      },
      {
        id: 'tiger-tales',
        name: 'Tiger Tales',
        handle: 'tiger-tales',
        imageUrl: 'https://images.unsplash.com/photo-1500259783852-0ca9ce8a64dc?w=400&q=80',
      },
      {
        id: 'woodland-friends',
        name: 'Woodland Friends',
        handle: 'woodland-friends',
        imageUrl: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=400&q=80',
      },
      {
        id: 'halloween',
        name: 'Halloween',
        handle: 'halloween',
        imageUrl: 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=400&q=80',
      },
    ],
  },

  // ── MAIN PRODUCT FEED ───────────────────────────────────────────────────
  // Label only. The heading and its standfirst were removed, so the feed opens
  // on "The Collection" and the sort control, and the products start higher up
  // the page. Each strip inside still carries its own category heading, which is
  // what a shopper actually navigates by.
  productFeed: {
    section: {
      label: 'The Collection',
    },
  },

  // ── NAVIGATION ──────────────────────────────────────────────────────────
  nav: [
    { label: 'Boys', href: '/shop/boys' },
    { label: 'Girls', href: '/shop/girls' },
    { label: 'Toddler', href: '/shop/toddler' },
    { label: 'Baby', href: '/shop/baby' },
  ],
};
