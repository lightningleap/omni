import type {
  AttributeKey,
  FilterConfig,
  FilterState,
  ProductFlag,
  SortKey,
} from '@/types/plp';
import { EMPTY_FILTER_STATE } from './filterEngine';

/**
 * Filter state ⇄ URL.
 *
 * The URL is the shareable representation of what the shopper is looking at:
 * `/shop/kids?colors=blue,rainbow&themes=dinosaurs&maxPrice=499&sort=newest`.
 * Values are validated against the audience's own config on the way in, so a
 * hand-edited or stale link can never push an unknown facet into the engine.
 */

const FLAGS: ProductFlag[] = ['new', 'trending', 'bestseller'];

/** Accepts both Next's `searchParams` shape and a real `URLSearchParams`. */
export type ParamInput = Record<string, string | string[] | undefined> | URLSearchParams;

function read(params: ParamInput, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function readList(params: ParamInput, key: string): string[] {
  const raw = read(params, key);
  if (!raw) return [];
  return raw.split(',').map((v) => v.trim().toLowerCase()).filter(Boolean);
}

function readNumber(params: ParamInput, key: string): number | null {
  const raw = read(params, key);
  if (raw === undefined || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** The facet keys this audience actually offers, with their legal values. */
function allowedValues(config: FilterConfig): Map<AttributeKey, Set<string>> {
  const map = new Map<AttributeKey, Set<string>>();
  for (const group of config.groups) {
    if (!group.attribute || !group.options?.length) continue;
    const existing = map.get(group.attribute) ?? new Set<string>();
    for (const option of group.options) existing.add(option.value);
    map.set(group.attribute, existing);
  }
  // The colour rail may offer swatches the panel doesn't list.
  if (config.colorRail?.length) {
    const colors = map.get('colors') ?? new Set<string>();
    for (const option of config.colorRail) colors.add(option.value);
    map.set('colors', colors);
  }
  return map;
}

export function parseFilterState(params: ParamInput, config: FilterConfig): FilterState {
  const allowed = allowedValues(config);
  const facets: Partial<Record<AttributeKey, string[]>> = {};

  for (const [key, legal] of allowed) {
    const selected = readList(params, key).filter((v) => legal.has(v));
    if (selected.length) facets[key] = selected;
  }

  const flags = readList(params, 'flags').filter((f): f is ProductFlag =>
    FLAGS.includes(f as ProductFlag)
  );

  const rawSort = read(params, 'sort');
  const sort = config.sorts.some((s) => s.value === rawSort)
    ? (rawSort as SortKey)
    : EMPTY_FILTER_STATE.sort;

  const minPrice = readNumber(params, 'minPrice');
  const maxPrice = readNumber(params, 'maxPrice');

  return {
    facets,
    // A reversed range filters everything out; treat it as unset rather than
    // handing the shopper an empty grid they can't explain.
    minPrice: minPrice !== null && maxPrice !== null && minPrice > maxPrice ? null : minPrice,
    maxPrice,
    flags,
    sort,
  };
}

/** Serialise back to a query string. Defaults are omitted, so a clean PLP has a clean URL. */
export function serializeFilterState(state: FilterState): string {
  const params = new URLSearchParams();

  for (const [key, values] of Object.entries(state.facets)) {
    if (values?.length) params.set(key, values.join(','));
  }
  if (state.flags.length) params.set('flags', state.flags.join(','));
  if (state.minPrice !== null) params.set('minPrice', String(state.minPrice));
  if (state.maxPrice !== null) params.set('maxPrice', String(state.maxPrice));
  if (state.sort !== EMPTY_FILTER_STATE.sort) params.set('sort', state.sort);

  return params.toString();
}
