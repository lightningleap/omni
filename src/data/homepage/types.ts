/**
 * Homepage content model — the contract every storefront mode fills in.
 *
 * The homepage is ONE page with TWO modes (Adult / Kids). Layout, order and
 * styling live in the components; everything a mode can change lives here, so a
 * future team can customise Kids end-to-end by editing `kidsHomepage.ts` alone —
 * no React changes.
 *
 * Two kinds of content are modelled separately:
 *   • Editorial content (copy, imagery, links) — static, authored in the data
 *     files below.
 *   • Catalogue data (products) — fetched from the database per request and
 *     handed in as a `HomepageDataset`.
 */

/** The two storefront audiences the header toggle switches between. */
export type HomepageMode = 'adult' | 'kids';

/** Adult is the canonical mode: it is what the server renders and what SEO sees. */
export const DEFAULT_HOMEPAGE_MODE: HomepageMode = 'adult';

/** Standard heading block used by every section (see `SectionHeader`). */
export interface SectionCopy {
  /**
   * Optional, because a section can lead with its label alone.
   *
   * Where the content below it already says what it is — a feed whose every
   * strip carries its own category heading — a second, larger heading above
   * them is a line to scroll past rather than a way in.
   */
  title?: string;
  subtitle?: string;
  /** Optional small uppercase label above the title. */
  label?: string;
}

export interface CtaLink {
  label: string;
  href: string;
}

/**
 * The welcome / brand intro at the top of the homepage.
 *
 * This replaced the full-bleed video hero. The video did not go away — it moved
 * into one of the three promotional cards below (see `videoSlot`), which is what
 * the shop asked for: the film is merchandising, not a wall to scroll past. What
 * is left up top is a compact, typographic introduction that says who makes this
 * and sends the visitor either into the catalogue or into the founder's story.
 */
export interface WelcomeData {
  /** Small editorial label above the heading; omit → not rendered. */
  badge?: string;
  /**
   * Primary headline, set in the wordmark's uppercase treatment; omit → not
   * rendered, and `titleSupporting` stands as the heading on its own.
   *
   * Optional because the brand plate directly above this section already
   * carries the lockup: a mode whose banner says the name does not need to
   * print it again immediately beneath.
   */
  title?: string;
  /** Supporting line beneath the headline — the heading itself when `title` is omitted. */
  titleSupporting: string;
  /** Tagline under the headline; `null` → not rendered. */
  tagline: string | null;
  /** Primary action — into the catalogue. */
  cta: CtaLink;
  /** Secondary action — typically the founder's story. Omit → not rendered. */
  secondaryCta?: CtaLink;
}

/**
 * One promotional collection card — the three cards directly below the hero.
 *
 * These mirror the shop's Etsy collections (Teacher Gifts, Book Lovers, Funny
 * Shirts…) and its running promotions (Sale, Bestsellers, Seasonal), so the site
 * and the Etsy storefront promote the same edits. Authored once in
 * `collections.ts` and referenced by `id`, which is also the key a CMS row would
 * map to — see `pickCollections`.
 */
export interface CollectionCardItem {
  /** Stable key. Also the CMS/Etsy identifier for this collection. */
  id: string;
  title: string;
  /** Short supporting line (max two lines). */
  description: string;
  /**
   * Optional supporting note under the description — "Limited time",
   * "Most loved this month". Left off rather than printing a number the
   * catalogue can't substantiate.
   */
  meta?: string;
  /** Default (full-bleed) studio image. */
  image: string;
  /**
   * Hover image: the artwork isolated on white, product-photo style. Optional —
   * a card without one keeps the same lift and zoom, it simply doesn't swap.
   */
  productImage?: string;
  href: string;
  /** Accessible verb for the card label, e.g. "Shop the Sale". */
  ariaLabel: string;
  /** Card button label. Defaults to "Explore". */
  ctaLabel?: string;
  /**
   * Marks this card as the one that plays the shop's film.
   *
   * The clips themselves are admin-configured (StoreConfig.heroVideoUrls), not
   * authored here, so the section injects them at render time into whichever
   * card carries this flag. Exactly one card per mode should set it. A card
   * marked as the video slot with no clips configured falls back to its still
   * `image` and is indistinguishable from its neighbours — the row is never
   * left with a black rectangle in it.
   */
  videoSlot?: boolean;
}

/**
 * One circle in the Browse Collections rail.
 *
 * Deliberately flat: the rail is a navigator, not a merchandising surface, so an
 * entry carries only what a circle draws — a name, an image, and the handle it
 * links to. No product count: a number under every name added clutter without
 * adding a reason to click, and made the row read as a data table.
 */
export interface CollectionCircleItem {
  /** Stable key. */
  id: string;
  /** Display name, exactly as it should read under the circle. */
  name: string;
  /** Collection handle — the rail links to `/collections/<handle>`. */
  handle: string;
  /**
   * Thumbnail cropped into the circle. Optional: when it is absent the server
   * supplies one from the collection's own products (see `getCategoryImages`
   * in app/page.tsx), which is better than a stock photo of someone else's
   * merchandise.
   */
  imageUrl?: string;
}

/** A header navigation entry. */
export interface NavLink {
  label: string;
  href: string;
}

/** Everything a single mode contributes to the homepage. */
export interface HomepageContent {
  mode: HomepageMode;
  /** Human label for the mode, used by the header toggle and menu groups. */
  label: string;
  /** The compact brand intro at the top of the page. */
  welcome: WelcomeData;
  /**
   * The three promotional windows below the welcome block. Re-merchandising the
   * homepage is a matter of changing which ids this array holds — see
   * `collections.ts` for the full set available. One of the three should carry
   * `videoSlot: true`.
   */
  featuredCollections: CollectionCardItem[];
  /**
   * The Browse Collections circle rail — this mode's own categories.
   *
   * Per-mode rather than shared, because the two shops sell genuinely different
   * things: Adult runs French with Attitude / Witchy & Gothic / Feminist &
   * Unfiltered, Kids runs Dinosaur World / Capybara Club / Woodland Friends.
   * Showing one audience's categories to the other is exactly the leak the
   * Adult/Kids split exists to prevent.
   */
  browseCollections: {
    section: SectionCopy;
    items: CollectionCircleItem[];
  };
  /** Heading copy for the main product feed. */
  productFeed: {
    section: SectionCopy;
  };
  /** Header / mobile-drawer navigation for this mode. */
  nav: NavLink[];
}

/**
 * A product as the storefront cards consume it (see `getHomepageData`).
 *
 * The last three fields exist so the product feed can sort for real rather than
 * approximately: `createdAt` backs "Newest", `unitsSold` backs "Best Selling"
 * (aggregated from order history), and `attributes` backs the age sorts. The
 * shape satisfies `Sortable` structurally, so it goes straight into the shared
 * sorting engine.
 */
export interface HomepageProduct {
  _id: string;
  name: string;
  slug: string;
  /** Pre-formatted for display, e.g. "$24.00". */
  price: string;
  rawPrice: number;
  image: string;
  description: string;
  category: string;
  /** ISO timestamp. */
  createdAt: string;
  unitsSold: number;
  /**
   * Which category strip this product belongs in — one of the ids in
   * `data/productCategories.ts`. Resolved on the server against the FULL Etsy
   * listing title rather than the shortened card title, because the clause
   * trimmed for display is often where the garment is actually named.
   */
  categoryId: string;
  attributes: {
    colors?: string[];
    ageRanges?: string[];
  };
  /**
   * Small badge above the product name on the card. DERIVED, never authored:
   * "Best Seller" comes from real order history and "New" from the row's own
   * `createdAt` (see `getHomepageData`). A product that is neither carries no
   * badge rather than a filler one.
   */
  tag?: string;
  /**
   * The exact Etsy listing this product is sold as (see `data/etsyListings.ts`).
   * Present on every feed product, because the feed is narrowed to products that
   * are actually published to Etsy; optional on the type because the same card
   * renders catalogue rows elsewhere on the site that have no listing.
   */
  etsyUrl?: string;
}

/** The slice of the session the product cards need. */
export interface HomepageUser {
  id: string;
  email?: string | null;
  role: string;
}

/**
 * Catalogue data for one mode, resolved on the server per request.
 *
 * Both modes are served the same rows today — the per-mode shape is the point:
 * giving Kids its own products later is a change to the queries in
 * `getHomepageData()`, never to a component.
 */
export interface HomepageDataset {
  /** Products in the main homepage feed. */
  products: HomepageProduct[];
}

export type HomepageDataByMode = Record<HomepageMode, HomepageDataset>;

/** Content shared by both modes — rendered identically whatever is selected. */
export interface SharedHomepageContent {
  newsletter: {
    label: string;
    title: string;
    subtitle: string;
    placeholder: string;
    submitLabel: string;
  };
  /** Label above the collection list in the mobile drawer. */
  collectionsMenuLabel: string;
}
