"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ActiveFilterChip,
  AttributeKey,
  FilterConfig,
  FilterPatch,
  FilterState,
  PlpProduct,
  ProductFlag,
  ShopCategory,
  SortKey,
} from '@/types/plp';
import {
  applyCategoryScope,
  computeFacetCounts,
  hasActiveFilters,
  selectProducts,
} from '@/utils/plp/filterEngine';
import { serializeFilterState } from '@/utils/plp/filterUrl';
import { CURRENCY_SYMBOL } from '@/filters';

/**
 * The PLP's state layer: selections in, filtered products + chips + counts out.
 *
 * ── Why React state and not the router ───────────────────────────────────────
 * Filtering must be instant and flicker-free. `router.push`/`replace` re-runs
 * the server component on every tick of a checkbox — a network round trip and a
 * re-render for work that is already in memory. So selections live in React,
 * the products are filtered locally, and the URL is mirrored with the native
 * History API (`replaceState`), which updates the address bar without waking
 * the router. Links stay shareable and reloadable; nothing refetches.
 *
 * `replaceState` (not `pushState`) is deliberate: every swatch tap would
 * otherwise become a history entry, and Back would walk the shopper through
 * their own filtering one click at a time instead of returning them to where
 * they came from.
 */
export interface UsePlpFiltersResult {
  state: FilterState;
  /** Products after the category scope, the filters and the sort. */
  products: PlpProduct[];
  /** Result count — what the header and the toolbar display. */
  total: number;
  /** `attribute:value` → how many products that option would leave. */
  counts: Record<string, number>;
  activeChips: ActiveFilterChip[];
  isFiltered: boolean;
  toggleFacet: (key: AttributeKey, value: string) => void;
  isFacetActive: (key: AttributeKey, value: string) => boolean;
  setPriceRange: (min: number | null, max: number | null) => void;
  setSort: (sort: SortKey) => void;
  toggleQuickChip: (patch: FilterPatch) => void;
  isPatchActive: (patch: FilterPatch) => boolean;
  clearAll: () => void;
}

export function usePlpFilters(
  allProducts: PlpProduct[],
  config: FilterConfig,
  category: ShopCategory,
  initialState: FilterState
): UsePlpFiltersResult {
  const [state, setState] = useState<FilterState>(initialState);

  // Mirror to the address bar. Effect, not render, because it touches History.
  useEffect(() => {
    const qs = serializeFilterState(state);
    const url = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
    if (url !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, '', url);
    }
  }, [state]);

  // The category's own narrowing runs once — it can't change under the shopper.
  const scoped = useMemo(
    () => applyCategoryScope(allProducts, category),
    [allProducts, category]
  );

  const products = useMemo(() => selectProducts(scoped, state), [scoped, state]);
  const counts = useMemo(() => computeFacetCounts(scoped, state, config), [scoped, state, config]);

  const toggleFacet = useCallback((key: AttributeKey, value: string) => {
    setState((prev) => {
      const current = prev.facets[key] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      const facets = { ...prev.facets };
      if (next.length) facets[key] = next;
      else delete facets[key];
      return { ...prev, facets };
    });
  }, []);

  const isFacetActive = useCallback(
    (key: AttributeKey, value: string) => Boolean(state.facets[key]?.includes(value)),
    [state.facets]
  );

  const setPriceRange = useCallback((min: number | null, max: number | null) => {
    setState((prev) =>
      prev.minPrice === min && prev.maxPrice === max
        ? prev
        : { ...prev, minPrice: min, maxPrice: max }
    );
  }, []);

  const setSort = useCallback((sort: SortKey) => {
    setState((prev) => (prev.sort === sort ? prev : { ...prev, sort }));
  }, []);

  const toggleFlag = useCallback((flag: ProductFlag) => {
    setState((prev) => ({
      ...prev,
      flags: prev.flags.includes(flag)
        ? prev.flags.filter((f) => f !== flag)
        : [...prev.flags, flag],
    }));
  }, []);

  const isPatchActive = useCallback(
    (patch: FilterPatch) => {
      if (patch.flag) return state.flags.includes(patch.flag);
      if (patch.maxPrice !== undefined) return state.maxPrice === patch.maxPrice;
      if (patch.facet) return Boolean(state.facets[patch.facet.key]?.includes(patch.facet.value));
      return false;
    },
    [state]
  );

  const toggleQuickChip = useCallback(
    (patch: FilterPatch) => {
      if (patch.flag) return toggleFlag(patch.flag);
      if (patch.facet) return toggleFacet(patch.facet.key, patch.facet.value);
      if (patch.maxPrice !== undefined) {
        setState((prev) => ({
          ...prev,
          maxPrice: prev.maxPrice === patch.maxPrice ? null : patch.maxPrice!,
        }));
      }
    },
    [toggleFacet, toggleFlag]
  );

  const clearAll = useCallback(() => {
    setState((prev) => ({ facets: {}, minPrice: null, maxPrice: null, flags: [], sort: prev.sort }));
  }, []);

  // ── Active chips ──────────────────────────────────────────────────────────
  // Labels come from the config so a chip always reads the way the option that
  // set it reads ("Organic Cotton", not "organic-cotton").
  const optionLabels = useMemo(() => {
    const labels = new Map<string, string>();
    for (const group of config.groups) {
      if (!group.attribute) continue;
      for (const option of group.options ?? []) {
        labels.set(`${group.attribute}:${option.value}`, option.label);
      }
    }
    for (const option of config.colorRail ?? []) {
      labels.set(`colors:${option.value}`, option.label);
    }
    return labels;
  }, [config]);

  const activeChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];

    for (const [key, values] of Object.entries(state.facets) as [AttributeKey, string[]][]) {
      for (const value of values) {
        chips.push({
          id: `${key}:${value}`,
          label: optionLabels.get(`${key}:${value}`) ?? value,
          remove: () => toggleFacet(key, value),
        });
      }
    }

    const FLAG_LABELS: Record<ProductFlag, string> = {
      new: 'New',
      trending: 'Trending',
      bestseller: 'Best Sellers',
    };
    for (const flag of state.flags) {
      chips.push({ id: `flag:${flag}`, label: FLAG_LABELS[flag], remove: () => toggleFlag(flag) });
    }

    if (state.minPrice !== null || state.maxPrice !== null) {
      const label =
        state.minPrice !== null && state.maxPrice !== null
          ? `${CURRENCY_SYMBOL}${state.minPrice} – ${CURRENCY_SYMBOL}${state.maxPrice}`
          : state.maxPrice !== null
            ? `Under ${CURRENCY_SYMBOL}${state.maxPrice}`
            : `Over ${CURRENCY_SYMBOL}${state.minPrice}`;
      chips.push({ id: 'price', label, remove: () => setPriceRange(null, null) });
    }

    return chips;
  }, [state, optionLabels, toggleFacet, toggleFlag, setPriceRange]);

  return {
    state,
    products,
    total: products.length,
    counts,
    activeChips,
    isFiltered: hasActiveFilters(state),
    toggleFacet,
    isFacetActive,
    setPriceRange,
    setSort,
    toggleQuickChip,
    isPatchActive,
    clearAll,
  };
}
