import type { CollectionCardItem, HomepageMode } from './types';

/**
 * The collection registry — every edit the homepage cards can promote.
 *
 * WHY THIS FILE EXISTS
 * The homepage promotes the SAME collections the shop runs on Etsy, so a
 * customer arriving from a listing lands somewhere they recognise and the site
 * reads as the official home of the Etsy shop rather than a separate catalogue.
 * Broad retail categories (Men / Women / Unisex) said nothing about what this
 * studio actually makes; these say it in the shopper's own words.
 *
 * TWO KINDS OF ENTRY
 *   • Promotions — `sale`, `bestsellers`, `seasonal`. Evergreen slots whose
 *     contents change without the card changing.
 *   • Etsy collections — the themed edits (Teacher Gifts, Book Lovers, Camping…)
 *     that mirror the shop's own sections.
 *
 * HOW TO RE-MERCHANDISE
 * The homepage shows three cards. Which three is a single array of ids in
 * `adultHomepage.ts` / `kidsHomepage.ts` — change the ids, not the components.
 * Adding a new collection means adding one entry here. Nothing else reads the
 * card shape, so this file is the whole content surface a CMS would replace:
 * swap `COLLECTIONS` for a fetch that returns the same `CollectionCardItem`s and
 * every consumer keeps working.
 *
 * IMAGERY: the URLs below are on-brand *placeholders* (Unsplash). Swap each
 * `image` for the shop's own photography — the design worn or styled in a warm,
 * natural setting — and each `productImage` for the artwork isolated on white
 * (see public/categories/README.md).
 */
export const COLLECTIONS: Record<string, CollectionCardItem> = {
  // ── PROMOTIONAL SLOTS ───────────────────────────────────────────────────
  sale: {
    id: 'sale',
    title: 'Sale',
    description: 'Studio favourites at a friendlier price, while they last.',
    meta: 'Limited time',
    // No `sale` row exists either — see the note on `bestsellers`.
    href: '/collections/all',
    ariaLabel: 'Shop the sale',
    ctaLabel: 'Shop Sale',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1000&q=80',
    productImage: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1000&q=80',
  },
  bestsellers: {
    id: 'bestsellers',
    // "Most loved" was the `meta` line under the description; it is the heading
    // now, so the meta is gone rather than repeated. `id`, `href` and
    // `ariaLabel` still name the collection — the destination has not moved, and
    // the aria label is what keeps three identical "Shop" buttons tellable
    // apart for a screen reader.
    title: 'Most loved',
    description: 'The designs our customers keep coming back for.',
    // NOTE: there is no `bestsellers` collection in the catalogue, and linking
    // to one produced a "Collection Coming Soon" dead end. Until a curated row
    // exists, this opens the full catalogue.
    href: '/collections/all',
    ariaLabel: 'Shop bestsellers',
    ctaLabel: 'Shop',
    image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1000&q=80',
    productImage: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=1000&q=80',
  },
  // The film's home. `videoSlot` is what moves the shop's video out of a
  // full-viewport banner and into the merchandising row: the section injects the
  // admin-configured clips into whichever card carries this flag, and the card
  // keeps the exact dimensions, overlay, copy block and button of its two
  // neighbours. With no clips configured it quietly renders as a normal card on
  // the still below.
  'new-designs': {
    id: 'new-designs',
    title: 'New',
    description: 'The newest artwork off the desk, in motion.',
    href: '/collections/all',
    ariaLabel: 'Shop the newest designs',
    ctaLabel: 'Shop',
    videoSlot: true,
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1000&q=80',
  },
  seasonal: {
    id: 'seasonal',
    // Same move as `bestsellers`: the old meta line is the heading now, so it
    // is not also printed underneath.
    title: 'Fresh this month',
    description: 'New artwork drawn for the season we are actually in.',
    // Same as `bestsellers`: no `seasonal` row exists yet.
    href: '/collections/all',
    ariaLabel: 'Shop the seasonal collection',
    ctaLabel: 'Shop',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=80',
    productImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1000&q=80',
  },

  // ── ETSY COLLECTIONS ────────────────────────────────────────────────────
  'teacher-gifts': {
    id: 'teacher-gifts',
    title: 'Teacher Gifts',
    description: 'Hand-lettered thank-yous for the people who show up daily.',
    href: '/collections/teacher-gifts',
    ariaLabel: 'Shop teacher gifts',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1000&q=80',
  },
  'book-lovers': {
    id: 'book-lovers',
    title: 'Book Lovers',
    description: 'For the ones with a to-be-read pile and no regrets.',
    href: '/collections/book-lovers',
    ariaLabel: 'Shop the book lovers collection',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1000&q=80',
  },
  camping: {
    id: 'camping',
    title: 'Camping',
    description: 'Illustrated for long trails, late fires and early starts.',
    href: '/collections/camping',
    ariaLabel: 'Shop the camping collection',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1000&q=80',
  },
  'coffee-lovers': {
    id: 'coffee-lovers',
    title: 'Coffee Lovers',
    description: 'Drawn for anyone who talks after the first cup, not before.',
    href: '/collections/coffee-lovers',
    ariaLabel: 'Shop the coffee lovers collection',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1000&q=80',
  },
  'funny-shirts': {
    id: 'funny-shirts',
    title: 'Funny Shirts',
    description: 'Original one-liners, drawn by hand and worn on purpose.',
    href: '/collections/funny-shirts',
    ariaLabel: 'Shop funny shirts',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1000&q=80',
  },
  'dog-lovers': {
    id: 'dog-lovers',
    title: 'Dog Lovers',
    description: 'Portraits and puns for people owned by a dog.',
    href: '/collections/dog-lovers',
    ariaLabel: 'Shop the dog lovers collection',
    image: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=1000&q=80',
  },
  'cat-lovers': {
    id: 'cat-lovers',
    title: 'Cat Lovers',
    description: 'Illustrated with the affection your cat will never return.',
    href: '/collections/cat-lovers',
    ariaLabel: 'Shop the cat lovers collection',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1000&q=80',
  },
  holiday: {
    id: 'holiday',
    title: 'Holiday',
    description: 'Gift-ready artwork for the whole run of the season.',
    href: '/collections/holiday',
    ariaLabel: 'Shop the holiday collection',
    image: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1000&q=80',
  },
  halloween: {
    id: 'halloween',
    title: 'Halloween',
    description: 'Hand-drawn spooky, printed in small batches each autumn.',
    href: '/collections/halloween',
    ariaLabel: 'Shop the Halloween collection',
    image: 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=1000&q=80',
  },
  christmas: {
    id: 'christmas',
    title: 'Christmas',
    description: 'Original festive illustration, matching sets included.',
    href: '/collections/christmas',
    ariaLabel: 'Shop the Christmas collection',
    image: 'https://images.unsplash.com/photo-1543258103-a62bdc069871?w=1000&q=80',
  },
  'back-to-school': {
    id: 'back-to-school',
    title: 'Back To School',
    description: 'First-day designs that survive the whole term.',
    href: '/collections/back-to-school',
    ariaLabel: 'Shop the back to school collection',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000&q=80',
  },
};

/**
 * Resolve card ids to cards, in the order given.
 *
 * Unknown ids are dropped rather than thrown on: a CMS entry pointing at a
 * retired collection should quietly show one card fewer, not take the homepage
 * down. Passing `audience` appends the `?audience=` param the collection routes
 * filter on, so a Kids card lands on the Kids cut of that collection.
 */
export function pickCollections(ids: string[], audience?: HomepageMode): CollectionCardItem[] {
  return ids.flatMap((id) => {
    const item = COLLECTIONS[id];
    if (!item) return [];
    if (!audience) return [item];
    return [{ ...item, href: `${item.href}?audience=${audience}` }];
  });
}
