/**
 * The homepage feed's category sections — one registry, both storefronts.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 * The feed used to be one continuous grid of everything. It is now grouped into
 * category strips (T-Shirts, Hoodies & Sweatshirts, Totes & Bags, …), each with
 * its own heading and its own horizontal rail. This file is the ONE place that
 * decides which product lands in which strip and how many rows that strip gets.
 * Nothing in the UI branches on a product type; `ProductFeedSection` reads the
 * list below in order and renders whatever has products.
 *
 * ── WHY NOT `productAttributes.ts` ──────────────────────────────────────────
 * That adapter resolves the seven facets the PLP filter panel offers, and its
 * `categories` table is scoped to what those filters need (tees, tanks, hoodies,
 * sweatshirts, oversized, long-sleeve). It knows nothing about mugs, totes or
 * caps — the shop's non-apparel — and widening it would change every filter
 * count and chip on the listing pages for a reason that has nothing to do with
 * filtering. This resolves ONE thing instead: the product's *type*, the single
 * axis the feed groups on. Same keyword-matching technique, same honesty about
 * what it cannot know (an unmatched product falls to the last section rather
 * than being dropped from the page).
 *
 * ── WHEN REAL DATA LANDS ────────────────────────────────────────────────────
 * `Product` has no product-type column: the catalogue's type signal lives in the
 * Etsy listing title, which is written by the studio and names the garment
 * ("… Sturdy Tote Bag", "… 15oz Mug", "… Youth Hoodie"). When a real type column
 * or a Printify blueprint mapping exists, replace the body of
 * `resolveProductCategoryId` with a column read and delete `TYPE_KEYWORDS`.
 * Every heading, row count and rail keeps working untouched.
 *
 * ── ADULT AND KIDS ──────────────────────────────────────────────────────────
 * One registry serves both. The two catalogues genuinely differ — the Kids shop
 * sells no totes and no caps today — so a section with nothing in it simply does
 * not render for that mode. Neither storefront is ever shown the other's
 * products: the split happens upstream, on `Product.audience`.
 */

/** A category strip, as the feed renders it. */
export interface ProductCategorySectionDef {
  /** Stable id — used as the React key and the section's anchor. */
  id: string;
  /** The heading above the strip. */
  title: string;
  /**
   * How many product rows the strip lays out. Both rows of a two-row strip live
   * in one scroll container and move together — see `ProductCategorySection`.
   */
  rows: 1 | 2;
}

/**
 * The sections, IN THE ORDER THEY APPEAR ON THE PAGE.
 *
 * ── TWO ORDERS, AND THEY ARE NOT THE SAME ───────────────────────────────────
 * The array order is the page order: T-Shirts opens the feed because it is what
 * the shop mostly sells and what a shopper came for, and the catch-all closes
 * it. `matchOrder` is a different sequence entirely — the order the keyword
 * tables are TESTED in, which has to run specific-before-broad.
 *
 * That distinction is load-bearing. These titles are SEO-written and name
 * several things at once: "Do Not Disturb hoodie | White pullover sweatshirt,
 * Pink retro text" is a hoodie, and "My Other Bag Is Also Not A Birkin Bag Tote
 * Bag | Canvas Tote" is a tote. Testing the narrow types (mugs, bags, hats)
 * before the broad apparel ones is what stops a tote whose title mentions a
 * shirt from landing in T-Shirts. Rendering in that same sequence, on the other
 * hand, would open the homepage on three mugs.
 *
 * To re-merchandise the feed, move an entry up or down — `matchOrder` does not
 * need to follow. To fix a mis-filed product, adjust a keyword list or a
 * `matchOrder`; nothing in the UI needs to know.
 *
 * The last entry has no keywords: it is the catch-all, so no published product
 * can fall off the homepage just because nobody thought of its noun.
 */
const SECTIONS: (ProductCategorySectionDef & { keywords: string[]; matchOrder: number })[] = [
  {
    id: 't-shirts',
    title: 'T-Shirts',
    // The deepest part of the catalogue by a distance, and the one a shopper
    // came for — it gets two rows so the strip carries its weight on the page
    // instead of running off the side as a single thin line.
    rows: 2,
    // Tested LAST of the real categories: it is by far the broadest table, and
    // "shirt" turns up in the long tail of titles that are really about
    // something else.
    matchOrder: 5,
    keywords: [
      'tee', 'tees', 't-shirt', 't-shirts', 'tshirt', 'tshirts', 'shirt', 'shirts',
      'tank', 'tanks', 'racerback', 'singlet', 'crop', 'ringer', 'jersey',
      'bodysuit', 'onesie',
    ],
  },
  {
    id: 'hoodies-and-sweatshirts',
    title: 'Hoodies & Sweatshirts',
    rows: 1,
    matchOrder: 4,
    keywords: ['hoodie', 'hoodies', 'hooded', 'sweatshirt', 'sweatshirts', 'crewneck', 'sweater', 'pullover'],
  },
  {
    id: 'totes-and-bags',
    title: 'Totes & Bags',
    rows: 1,
    matchOrder: 2,
    keywords: ['tote', 'totes', 'bag', 'bags', 'weekender', 'backpack', 'pouch', 'duffle'],
  },
  {
    id: 'hats-and-accessories',
    title: 'Hats & Accessories',
    rows: 1,
    matchOrder: 3,
    // 'cap' and 'caps' only as whole words — "Capybara" is a Kids character, not
    // a hat, and tokenising on word boundaries is what keeps them apart.
    keywords: ['hat', 'hats', 'cap', 'caps', 'beanie', 'bucket', 'visor', 'headband', 'bandana', 'scarf', 'socks'],
  },
  {
    id: 'mugs',
    title: 'Mugs',
    rows: 1,
    matchOrder: 1,
    keywords: ['mug', 'mugs', 'tumbler', 'drinkware'],
  },
  {
    id: 'more',
    // Named for what it is. The shop also sells notebooks, a pennant, a dress
    // and lounge pants; inventing a "Hats & Accessories" home for a journal
    // would be a worse answer than one honest strip at the end.
    title: 'More to Love',
    rows: 1,
    matchOrder: 99,
    keywords: [],
  },
];

/** The registry, in page order, without the matching machinery. */
export const PRODUCT_CATEGORY_SECTIONS: ProductCategorySectionDef[] = SECTIONS.map(
  ({ id, title, rows }) => ({ id, title, rows })
);

/** The same sections in the order their keyword tables are tested. */
const MATCH_SEQUENCE = [...SECTIONS].sort((a, b) => a.matchOrder - b.matchOrder);

/** The catch-all every unmatched product lands in. */
export const FALLBACK_CATEGORY_ID = MATCH_SEQUENCE[MATCH_SEQUENCE.length - 1].id;

/**
 * Whole-word, case-insensitive, punctuation-tolerant token set.
 *
 * Hyphens are kept inside tokens so "t-shirt" survives as one word — splitting
 * on them would turn every t-shirt into a "t" and a "shirt" and make the table
 * below match far more loosely than it reads.
 */
function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9-]+/)
      .filter(Boolean)
  );
}

/**
 * Which strip a product belongs in.
 *
 * Pass the RICHEST text available — on the homepage feed that is the full Etsy
 * listing title, not the shortened card title, because the clause trimmed for
 * display is often where the garment is actually named.
 *
 * Never returns null: a product with no recognisable type lands in the catch-all
 * rather than vanishing from the page.
 */
export function resolveProductCategoryId(...text: (string | null | undefined)[]): string {
  const tokens = tokenize(text.filter(Boolean).join(' '));

  // Specific types first — see the note on `matchOrder` above.
  for (const section of MATCH_SEQUENCE) {
    if (section.keywords.some((k) => tokens.has(k))) return section.id;
  }

  return FALLBACK_CATEGORY_ID;
}

/**
 * Group an already-ordered product list into the registry's sections.
 *
 * Order is preserved inside every group, which is what lets the feed's sort
 * control keep working: the section sorts once, groups after, and each strip
 * comes out in the chosen order. Empty sections are dropped, so the Kids feed
 * renders no "Totes & Bags" heading over nothing.
 *
 * Products are read from — never copied into — the array handed in. A product
 * appears in exactly one strip.
 */
export function groupByCategory<T extends { categoryId?: string; name: string }>(
  products: T[]
): { section: ProductCategorySectionDef; products: T[] }[] {
  const buckets = new Map<string, T[]>();

  for (const product of products) {
    // `categoryId` is resolved server-side against the full listing title (see
    // `getHomepageData`). Resolving from the card name is the fallback for any
    // caller that hasn't got one — less signal, same rules.
    const id = product.categoryId ?? resolveProductCategoryId(product.name);
    const bucket = buckets.get(id);
    if (bucket) bucket.push(product);
    else buckets.set(id, [product]);
  }

  return PRODUCT_CATEGORY_SECTIONS.flatMap((section) => {
    const items = buckets.get(section.id);
    return items?.length ? [{ section, products: items }] : [];
  });
}
