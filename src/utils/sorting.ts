import type { Sortable, SortKey, SortOptionDef } from '@/types/sorting';

/**
 * The sorting engine — one pure generic function every product surface calls.
 *
 * No component contains ordering logic: a section passes its products and the
 * selected key and gets a new array back. Adding a sort means adding a case
 * here and an option below, and every surface that offers it works at once.
 */

/** The set every audience offers. */
export const DEFAULT_SORT_OPTIONS: SortOptionDef[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'bestselling', label: 'Best Selling' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Customer Rating' },
];

/** Kids adds age ordering on top of the shared set. */
export const KIDS_SORT_OPTIONS: SortOptionDef[] = [
  ...DEFAULT_SORT_OPTIONS,
  { value: 'age-asc', label: 'Age: Youngest to Oldest' },
  { value: 'age-desc', label: 'Age: Oldest to Youngest' },
];

export function getSortOptions(audience: 'adult' | 'kids'): SortOptionDef[] {
  return audience === 'kids' ? KIDS_SORT_OPTIONS : DEFAULT_SORT_OPTIONS;
}

export const DEFAULT_SORT: SortKey = 'featured';

/**
 * Stable pseudo-popularity.
 *
 * There is no analytics signal in the schema, so this leans on real sales and
 * breaks ties with a hash of the product id. It is deterministic on purpose —
 * `Math.random` here would reshuffle the grid on every render and on every
 * reload, which reads as a bug. Replace with a real score when one exists.
 */
export function popularityScore(product: Sortable): number {
  let hash = 0;
  for (let i = 0; i < product._id.length; i++) {
    hash = (hash * 31 + product._id.charCodeAt(i)) | 0;
  }
  return (product.unitsSold ?? 0) * 1000 + (Math.abs(hash) % 1000);
}

/** Youngest-first ordering for the Kids age sorts. */
const AGE_ORDER = ['0-2', '3-5', '6-8', '9-12', 'teen'];
const UNKNOWN_AGE = Number.POSITIVE_INFINITY;

function ageIndex(product: Sortable): number {
  const owned = product.attributes?.ageRanges;
  if (!owned?.length) return UNKNOWN_AGE;
  const known = owned
    .map((age) => AGE_ORDER.indexOf(age))
    .filter((i) => i !== -1);
  return known.length ? Math.min(...known) : UNKNOWN_AGE;
}

/**
 * Age comparator, `dir` 1 for youngest-first and -1 for oldest-first.
 *
 * Unknown ages are ranked separately rather than given a sentinel index, so
 * they sort last in BOTH directions. Treating "unknown" as an age past `teen`
 * (the obvious shortcut) puts every unlabelled product at the very top of
 * "Oldest to Youngest" — the opposite of what a shopper picking an age
 * ordering is asking for.
 */
function byAge(dir: 1 | -1) {
  return (a: Sortable, b: Sortable): number => {
    const ia = ageIndex(a);
    const ib = ageIndex(b);
    const aUnknown = ia === UNKNOWN_AGE;
    const bUnknown = ib === UNKNOWN_AGE;

    if (aUnknown !== bUnknown) return aUnknown ? 1 : -1;
    if (aUnknown) return popularityScore(b) - popularityScore(a);

    return dir * (ia - ib) || popularityScore(b) - popularityScore(a);
  };
}

function time(product: Sortable): number {
  return product.createdAt ? Date.parse(product.createdAt) : 0;
}

/**
 * Sort a list of products. Always returns a new array — the input is never
 * mutated, so a section can keep its unsorted source for other uses.
 */
export function sortProducts<T extends Sortable>(products: T[], sort: SortKey): T[] {
  const out = [...products];

  switch (sort) {
    case 'price-asc':
      return out.sort((a, b) => (a.rawPrice ?? 0) - (b.rawPrice ?? 0));

    case 'price-desc':
      return out.sort((a, b) => (b.rawPrice ?? 0) - (a.rawPrice ?? 0));

    case 'newest':
      return out.sort((a, b) => time(b) - time(a));

    case 'bestselling':
      return out.sort(
        (a, b) => (b.unitsSold ?? 0) - (a.unitsSold ?? 0) || popularityScore(b) - popularityScore(a)
      );

    case 'age-asc':
      return out.sort(byAge(1));

    case 'age-desc':
      return out.sort(byAge(-1));

    case 'rating':
      // There is no Review model, so most products have no rating. Those that
      // carry one lead; the rest fall back to popularity rather than to an
      // invented score, so the option never claims a ranking the data can't
      // support and becomes exact the moment reviews land.
      return out.sort(
        (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || popularityScore(b) - popularityScore(a)
      );

    case 'popularity':
      return out.sort((a, b) => popularityScore(b) - popularityScore(a));

    case 'featured':
    default:
      // "Featured" is the order the catalogue arrived in — the merchandiser's
      // own sequence. Returning the copy untouched is the whole implementation.
      return out;
  }
}
