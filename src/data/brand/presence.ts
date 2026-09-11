import type { BrandPresence, SocialProfile } from './types';

/**
 * The two shops' real trading records.
 *
 * SOURCES — check these before editing any number below:
 *   Adult  https://www.etsy.com/shop/Unrwly?dd_referrer=
 *   Kids   https://www.etsy.com/shop/UNRWLYkids
 *
 * These figures are read off Etsy by hand and pasted here. That is deliberate:
 * fetching them at render time would make the storefront depend on Etsy being up
 * and would rate-limit under load, and caching a scrape adds a second source of
 * truth that can silently go stale. A shop's stats move a few times a month —
 * updating four numbers here when they do is the cheaper, safer trade.
 */

/** One Facebook page serves both audiences, so it is shared rather than duplicated. */
const FACEBOOK: SocialProfile = {
  id: 'facebook',
  label: 'UNRWLY on Facebook',
  href: 'https://www.facebook.com/profile.php?id=61589159982275',
};

/**
 * The Instagram handle the community section has always linked to. Shared like
 * Facebook — there is one account, not one per audience.
 */
const INSTAGRAM: SocialProfile = {
  id: 'instagram',
  label: 'UNRWLY on Instagram',
  href: 'https://www.instagram.com/unrwly',
};

export const adultPresence: BrandPresence = {
  mode: 'adult',
  shopName: 'Unrwly',
  etsyUrl: 'https://www.etsy.com/shop/Unrwly?dd_referrer=',
  reviewsUrl: 'https://www.etsy.com/shop/Unrwly#reviews',

  stats: {
    rating: 5.0,
    reviewCount: 8,
    sales: 54,
    tenure: { value: '2.5', unit: 'Years' },
  },

  // ── Verbatim reviews from the Adult shop ────────────────────────────────
  // Ordered by how completely they are attributed, because the section leads
  // with the first one and a review with a name, a date and the item bought is
  // far more convincing than a quote on its own.
  //
  // TO STRENGTHEN THIS SECTION: open the shop's reviews and transcribe the
  // reviewer, date and item onto the entries below that are missing them. Every
  // field is rendered the moment it exists — no code change. Six of the eight
  // reviews are not recorded here at all yet; adding them is more entries in
  // this array. What must NOT happen is pairing a name we know with a quote we
  // cannot confirm they wrote: a mismatched attribution is a fabricated review,
  // and this is the one section where that would do real damage.
  reviews: [
    {
      id: 'adult-michaela',
      rating: 5,
      quote: 'I love it, thanks a lot!',
      author: 'Michaela',
      date: 'Jun 11, 2026',
      product: { name: 'Oui Mais Non Weekender Bag' },
    },
    {
      id: 'adult-2',
      rating: 5,
      quote:
        'Such a great item! Excellent quality and will make a fab gift. Definitely exceeded expectations and quick shipping!',
    },
    {
      id: 'adult-3',
      rating: 5,
      quote: 'Adorable design! Thick quality fabric on the hat. Love it',
    },
    {
      id: 'adult-4',
      rating: 5,
      quote: 'Love this shirt! Even better than I expected!',
    },
    {
      id: 'adult-5',
      rating: 5,
      quote: 'Adorable! My daughter loves it',
    },
  ],

  socials: [
    { id: 'etsy', label: 'UNRWLY on Etsy', href: 'https://www.etsy.com/shop/Unrwly?dd_referrer=' },
    { id: 'pinterest', label: 'UNRWLY on Pinterest', href: 'https://www.pinterest.com/unrwly/' },
    INSTAGRAM,
    FACEBOOK,
  ],

  legacy: {
    label: 'Our Etsy Record',
    title: 'Real People. Real Orders. Real Reviews.',
    ctaLabel: 'View Our Etsy Shop',
  },

  follow: {
    title: 'Follow UNRWLY',
    subtitle: 'New artwork, work in progress and the odd studio mess — pick your channel.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// KIDS
//
// Same structure, same components, same level of finish — a different shop's
// record. The Kids shop is genuinely newer and smaller, and the numbers below
// say so. That is the point: 6 sales stated confidently is credible, and 54
// borrowed from the Adult shop would be a lie a customer could catch in one
// click. The design does the work of making both feel substantial; the data
// stays honest.
// ─────────────────────────────────────────────────────────────────────────────
export const kidsPresence: BrandPresence = {
  mode: 'kids',
  shopName: 'UNRWLYkids',
  etsyUrl: 'https://www.etsy.com/shop/UNRWLYkids',
  reviewsUrl: 'https://www.etsy.com/shop/UNRWLYkids#reviews',

  stats: {
    rating: 5.0,
    reviewCount: 1,
    sales: 6,
    tenure: { value: '1', unit: 'Month' },
  },

  // ONE review, and it stays one. The Kids shop has a single review, so the
  // section renders a single review: no navigation, no duplicated slides padded
  // out to look busier. A shop that is honestly new reads better than one
  // pretending otherwise, and a carousel of one repeated card is the kind of
  // detail a sceptical visitor notices immediately.
  reviews: [
    {
      id: 'kids-tanja',
      rating: 5,
      quote:
        'This is so adorable and exceptionally high quality and definitely exceeded our expectations! My daughter doesn’t wanna take it off anymore! Definitely recommend this shop!!',
      author: 'Tanja',
      date: 'Jun 25, 2026',
      // This review has a customer-uploaded photo on Etsy. Save it as
      // `public/etsy/kids-tanja.jpg` and add:
      //   customerPhoto: { src: '/etsy/kids-tanja.jpg', alt: '…' }
      // The card renders it the moment it is there. It is left out rather than
      // substituted, because a stand-in photo passed off as a customer's own is
      // exactly the fabrication this section exists to avoid.
    },
  ],

  socials: [
    { id: 'etsy', label: 'UNRWLY Kids on Etsy', href: 'https://www.etsy.com/shop/UNRWLYkids' },
    { id: 'pinterest', label: 'UNRWLY Kids on Pinterest', href: 'https://www.pinterest.com/unrwlykids/' },
    INSTAGRAM,
    FACEBOOK,
  ],

  legacy: {
    label: 'Our Etsy Record',
    title: 'Real People. Real Orders. Real Reviews.',
    ctaLabel: 'View Our Kids Etsy Shop',
  },

  // Named for the shop the visitor is actually in. Etsy and Pinterest above are
  // the Kids accounts; Instagram and Facebook are the single shared brand
  // accounts, which is why they appear in both bundles rather than being
  // duplicated per audience.
  follow: {
    title: 'Follow UNRWLY Kids',
    subtitle: 'New characters, new drops and the occasional work in progress — pick your channel.',
  },
};
