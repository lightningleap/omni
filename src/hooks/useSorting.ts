"use client";

import { useCallback, useMemo, useState } from 'react';
import type { Sortable, SortKey, SortOptionDef } from '@/types/sorting';
import { DEFAULT_SORT, getSortOptions, sortProducts } from '@/utils/sorting';

/**
 * Sorting state for one product section.
 *
 * Local by design: two sections on the same page sort independently, which is
 * what a shopper expects when each has its own control. Sorting happens in
 * memory from an array the server already sent, so changing it is a re-render —
 * no navigation, no refetch, no layout shift.
 *
 * Reusable as-is by Budget-Friendly Picks, OMG! Deals and any PLP section: hand
 * it products, get back sorted products plus everything the dropdown needs.
 */
export interface UseSortingResult<T extends Sortable> {
  /** The products in the selected order. */
  sorted: T[];
  sort: SortKey;
  setSort: (sort: SortKey) => void;
  /** The option list for this audience — Kids includes the age sorts. */
  options: SortOptionDef[];
  /** True when anything other than the default order is applied. */
  isSorted: boolean;
  reset: () => void;
}

export function useSorting<T extends Sortable>(
  products: T[],
  audience: 'adult' | 'kids' = 'adult',
  initialSort: SortKey = DEFAULT_SORT
): UseSortingResult<T> {
  const [sort, setSort] = useState<SortKey>(initialSort);

  const options = useMemo(() => getSortOptions(audience), [audience]);

  // Guard against a key this audience doesn't offer — switching from Kids to
  // Adult while "Age: Youngest to Oldest" is selected would otherwise leave the
  // dropdown displaying an option that is no longer in its own list.
  const effectiveSort = options.some((o) => o.value === sort) ? sort : initialSort;

  const sorted = useMemo(
    () => sortProducts(products, effectiveSort),
    [products, effectiveSort]
  );

  const reset = useCallback(() => setSort(initialSort), [initialSort]);

  return {
    sorted,
    sort: effectiveSort,
    setSort,
    options,
    isSorted: effectiveSort !== initialSort,
    reset,
  };
}
