import type { ShopAudience, ShopCategory } from '@/types/plp';

/**
 * The category registry — one entry per Product Listing Page.
 *
 * `/shop/<slug>` renders whichever entry matches, so adding a category (Teen,
 * Accessories, a seasonal campaign) means adding an object here. No new route,
 * no new component, no new filter panel.
 *
 * `scope` narrows the catalogue before the shopper touches anything: Toddler is
 * the Kids catalogue at ages 3–5, Boys is the Kids catalogue for boys. It runs
 * through the same matching engine as user filters, but only while the
 * attribute actually has coverage in the data — see `applyCategoryScope`.
 */

const HOME = { label: 'Home', href: '/' };
const SHOP = { label: 'Shop', href: '/shop/men' };
const KIDS = { label: 'Kids', href: '/shop/kids' };

export const SHOP_CATEGORIES: ShopCategory[] = [
  {
    slug: 'men',
    label: 'Men',
    audience: 'adult',
    description: 'Bold prints. Everyday comfort. Made for you.',
    breadcrumb: [HOME, SHOP],
  },
  {
    slug: 'women',
    label: 'Women',
    audience: 'adult',
    description: 'Effortless style. Original prints. For every mood.',
    breadcrumb: [HOME, SHOP],
  },
  {
    slug: 'unisex',
    label: 'Unisex',
    audience: 'adult',
    description: 'One cut, everyone. Easy shapes in every size.',
    breadcrumb: [HOME, SHOP],
    // Genuinely narrows: plenty of Adult products are titled "Unisex …", so this
    // scope has coverage today and the page lists a real subset rather than the
    // whole Adult catalogue.
    scope: { genders: ['unisex'] },
  },
  {
    slug: 'kids',
    label: 'Kids',
    audience: 'kids',
    description: 'Playful prints. Soft & comfy. Made for little legends.',
    breadcrumb: [HOME, SHOP],
  },
  {
    slug: 'boys',
    label: 'Boys',
    audience: 'kids',
    description: 'Playful prints. Built for the playground.',
    breadcrumb: [HOME, KIDS],
    scope: { genders: ['boys', 'unisex'] },
  },
  {
    slug: 'girls',
    label: 'Girls',
    audience: 'kids',
    description: 'Bright colours. Soft cotton. All-day comfort.',
    breadcrumb: [HOME, KIDS],
    scope: { genders: ['girls', 'unisex'] },
  },
  {
    slug: 'toddler',
    label: 'Toddler',
    audience: 'kids',
    description: 'Easy fits for little explorers on the move.',
    breadcrumb: [HOME, KIDS],
    scope: { ageRanges: ['3-5'] },
  },
  {
    slug: 'baby',
    label: 'Baby',
    audience: 'kids',
    description: 'Gentle fabrics. Made for the softest skin.',
    breadcrumb: [HOME, KIDS],
    scope: { ageRanges: ['0-2'] },
  },
];

// ── Fit listing pages ─────────────────────────────────────────────────────
// Each fit is a real, scoped listing page rather than a placeholder route: the
// scope runs through the same engine as every other category, so these pages
// list an actual subset the moment the catalogue carries the attribute.
//
// These pages stand on their own. The Adult homepage's "Shop by Fit" module
// used to link to them and has been removed; the routes are kept because they
// are live, indexable URLs reachable from filters and direct links.
const FIT_CATEGORIES: ShopCategory[] = [
  { slug: 'oversized', label: 'Oversized', description: 'Effortless everyday comfort.', scopeValue: 'oversized' },
  { slug: 'regular-fit', label: 'Regular Fit', description: 'A timeless everyday essential.', scopeValue: 'regular' },
  { slug: 'slim-fit', label: 'Slim Fit', description: 'Clean, modern silhouette.', scopeValue: 'slim' },
  { slug: 'relaxed-fit', label: 'Relaxed Fit', description: 'Laid-back comfort, room to move.', scopeValue: 'relaxed' },
  { slug: 'athleisure', label: 'Athleisure', description: 'Designed for movement.', scopeValue: 'athleisure' },
].map(({ slug, label, description, scopeValue }) => ({
  slug,
  label,
  audience: 'adult' as const,
  description,
  breadcrumb: [HOME, SHOP],
  scope: { fits: [scopeValue] },
}));

// ── Shop by Age (Kids homepage spotlight) ─────────────────────────────────
// Served from `/kids/<slug>`, so the URL reads the way a parent would say it.
const AGE_CATEGORIES: ShopCategory[] = [
  { slug: '0-2', label: '0–2 Years', description: 'Gentle first layers for the softest skin.' },
  { slug: '3-5', label: '3–5 Years', description: 'Perfect for preschool adventures.' },
  { slug: '6-8', label: '6–8 Years', description: 'Comfortable everyday essentials.' },
  { slug: '9-12', label: '9–12 Years', description: 'Bold prints they get to pick themselves.' },
  { slug: 'teen', label: 'Teen', description: 'Grown-up fits, still built to last.' },
].map(({ slug, label, description }) => ({
  slug,
  basePath: '/kids' as const,
  label,
  audience: 'kids' as const,
  description,
  breadcrumb: [HOME, KIDS],
  scope: { ageRanges: [slug] },
}));

export const ALL_SHOP_CATEGORIES: ShopCategory[] = [
  ...SHOP_CATEGORIES,
  ...FIT_CATEGORIES,
  ...AGE_CATEGORIES,
];

/** Registry lookup is namespaced by route family, so `/kids/teen` and a future
 *  `/shop/teen` could coexist without colliding. */
const BY_PATH = new Map(
  ALL_SHOP_CATEGORIES.map((c) => [`${c.basePath ?? '/shop'}/${c.slug}`, c])
);

export function getShopCategory(
  slug: string,
  basePath: '/shop' | '/kids' = '/shop'
): ShopCategory | undefined {
  return BY_PATH.get(`${basePath}/${slug.toLowerCase()}`);
}

/** The canonical URL for a registry entry. */
export function categoryHref(category: ShopCategory): string {
  return `${category.basePath ?? '/shop'}/${category.slug}`;
}

export const SHOP_CATEGORY_SLUGS = ALL_SHOP_CATEGORIES.filter(
  (c) => (c.basePath ?? '/shop') === '/shop'
).map((c) => c.slug);

export const KIDS_AGE_SLUGS = AGE_CATEGORIES.map((c) => c.slug);

/** Every listing page, for the sitemap. */
export const ALL_CATEGORY_HREFS = ALL_SHOP_CATEGORIES.map(categoryHref);

/**
 * The primary categories for one audience — Men / Women / Unisex, or
 * Kids / Boys / Girls / Toddler / Baby.
 *
 * This is the set a shopper moves BETWEEN, which is not the same as the set the
 * registry contains: the fit and age entries are also real listing pages, but
 * they are ways of narrowing a catalogue rather than sibling departments, and
 * putting all ten in one rail turns navigation into a filter panel. Those stay
 * reachable through the filters, where they belong.
 *
 * Derived from `SHOP_CATEGORIES` rather than listed again, so a new department
 * appears in the rail by virtue of existing.
 */
export function getPrimaryCategories(audience: ShopAudience): ShopCategory[] {
  return SHOP_CATEGORIES.filter((c) => c.audience === audience);
}
