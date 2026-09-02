import type {
  AttributeKey,
  FacetCounts,
  FilterConfig,
  FilterState,
  PlpProduct,
  ProductFlag,
  ShopCategory,
} from '@/types/plp';
import { sortProducts } from '@/utils/sorting';

export { sortProducts };

/**
 * The filtering and sorting engine — pure functions over plain data.
 *
 * Nothing here imports React or touches the DOM, so the same logic runs in a
 * component, a test, or (later) on the server against a real query. Components
 * decide what to render; this file decides what matches.
 */

export const EMPTY_FILTER_STATE: FilterState = {
  facets: {},
  minPrice: null,
  maxPrice: null,
  flags: [],
  sort: 'popularity',
};

/** A product matches a facet when it carries at least one of the selected values. */
function matchesFacet(product: PlpProduct, key: AttributeKey, selected: string[]): boolean {
  if (!selected.length) return true;
  const owned = product.attributes[key];
  if (!owned?.length) return false;
  return selected.some((value) => owned.includes(value));
}

/** "Trending" has no telemetry yet — see `TRENDING_TOP_N` below. */
function matchesFlag(product: PlpProduct, flag: ProductFlag, trendingIds: Set<string>): boolean {
  switch (flag) {
    case 'new':
      return product.isNew;
    case 'bestseller':
      return product.unitsSold > 0;
    case 'trending':
      return trendingIds.has(product._id);
  }
}

/**
 * "Trending" needs view/velocity telemetry the store does not collect. Until it
 * does, it means "the current best sellers" — a real signal (order history),
 * just a coarser one than true trending. Swap this for a telemetry query and
 * nothing else changes.
 */
const TRENDING_TOP_N = 12;

function computeTrendingIds(products: PlpProduct[]): Set<string> {
  return new Set(
    [...products]
      .filter((p) => p.unitsSold > 0)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, TRENDING_TOP_N)
      .map((p) => p._id)
  );
}

/**
 * Does this facet have any coverage in the catalogue?
 *
 * Used to decide whether a category's `scope` can be enforced. Boys / Girls /
 * Toddler / Baby scope on gender and age — attributes the schema cannot supply
 * yet — and enforcing an unbacked scope would render four permanently empty
 * pages. So a scope applies only once the data can honour it, and is skipped
 * (not faked) until then. User-selected filters are always strict; this
 * leniency is confined to the scope the URL implies.
 */
function facetHasCoverage(products: PlpProduct[], key: AttributeKey): boolean {
  return products.some((p) => p.attributes[key]?.length > 0);
}

export function applyCategoryScope(products: PlpProduct[], category: ShopCategory): PlpProduct[] {
  const scope = category.scope;
  if (!scope) return products;

  const enforceable = (Object.entries(scope) as [AttributeKey, string[]][]).filter(
    ([key]) => facetHasCoverage(products, key)
  );
  if (!enforceable.length) return products;

  return products.filter((product) =>
    enforceable.every(([key, values]) => matchesFacet(product, key, values))
  );
}

/** Every predicate except sorting. */
function matchesState(
  product: PlpProduct,
  state: FilterState,
  trendingIds: Set<string>,
  skipFacet?: AttributeKey
): boolean {
  if (state.minPrice !== null && product.rawPrice < state.minPrice) return false;
  if (state.maxPrice !== null && product.rawPrice > state.maxPrice) return false;

  for (const flag of state.flags) {
    if (!matchesFlag(product, flag, trendingIds)) return false;
  }

  for (const [key, values] of Object.entries(state.facets) as [AttributeKey, string[]][]) {
    if (key === skipFacet) continue;
    if (!matchesFacet(product, key, values)) return false;
  }

  return true;
}

/**
 * Filter, then sort. The one call the grid needs.
 *
 * Ordering is not implemented here — `utils/sorting` owns it, and the homepage
 * sections call the identical function. `PlpProduct` satisfies `Sortable`
 * structurally (id, price, createdAt, unitsSold, `attributes.ageRanges`), so no
 * adapter is needed between the two.
 */
export function selectProducts(products: PlpProduct[], state: FilterState): PlpProduct[] {
  const trendingIds = computeTrendingIds(products);
  const matched = products.filter((p) => matchesState(p, state, trendingIds));
  return sortProducts(matched, state.sort);
}

/**
 * How many products each option would leave, counted the way faceted search
 * expects: every OTHER facet applied, but not the one being counted — so
 * ticking a second size widens the result rather than appearing to do nothing.
 *
 * A zero here is what lets the panel show an option as unavailable instead of
 * letting the shopper click it into an empty grid.
 */
export function computeFacetCounts(
  products: PlpProduct[],
  state: FilterState,
  config: FilterConfig
): FacetCounts {
  const trendingIds = computeTrendingIds(products);
  const counts: FacetCounts = {};

  for (const group of config.groups) {
    const key = group.attribute;
    if (!key || !group.options?.length) continue;

    const candidates = products.filter((p) => matchesState(p, state, trendingIds, key));
    for (const option of group.options) {
      counts[`${key}:${option.value}`] = candidates.filter((p) =>
        p.attributes[key]?.includes(option.value)
      ).length;
    }
  }

  return counts;
}

/** Is anything narrowing the grid right now? */
export function hasActiveFilters(state: FilterState): boolean {
  return (
    state.flags.length > 0 ||
    state.minPrice !== null ||
    state.maxPrice !== null ||
    Object.values(state.facets).some((values) => values && values.length > 0)
  );
}
