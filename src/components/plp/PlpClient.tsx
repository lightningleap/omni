"use client";

import { useState } from 'react';
import PlpBackLink from './PlpBackLink';
import PlpBreadcrumb from './PlpBreadcrumb';
import CategoryNavigation from '@/components/CategoryNavigation';
import PlpHeader from './PlpHeader';
import PlpToolbar from './PlpToolbar';
import PlpFilterPanel from './PlpFilterPanel';

import ActiveFilterChips from './ActiveFilterChips';
import ShopByColorRail from './ShopByColorRail';
import PlpProductGrid from './PlpProductGrid';
import SizeAgePredictor from './future/SizeAgePredictor';
import FamilyMatchingBundle from './future/FamilyMatchingBundle';
import GiftFinderEntry from './future/GiftFinderEntry';
import RecentlyViewed from './future/RecentlyViewed';
import { FUTURE_FEATURES } from './future/futureFeatures';
import { usePlpFilters } from '@/hooks/usePlpFilters';
import { getFilterConfig } from '@/filters';
import type { HomepageUser } from '@/data/homepage';
import type { FilterState, PlpProduct, ShopCategory } from '@/types/plp';

/**
 * The Product Listing Page, assembled.
 *
 * This component owns layout and nothing else: the audience's `FilterConfig`
 * decides what can be filtered, `usePlpFilters` decides what matches, and the
 * pieces below render it. Men, Women, Kids, Boys, Girls, Toddler and Baby all
 * run through this exact file — the only difference between an Adult PLP and a
 * Kids one is which config was looked up.
 *
 * Section order: back link → breadcrumb → title + count → department rail →
 * sticky filter/sort bar → (Kids) Shop by Colour → active chips → grid → load
 * more. The footer comes from the root layout, as on every other page.
 *
 * ── THE PAGE IS ONE COLUMN ──────────────────────────────────────────────────
 * It used to be a flex row: a 260px filter sidebar beside a `flex-1` results
 * column. Every child below the toolbar was nested inside that column, and the
 * grid never saw the container's full width. The filters are a drawer now, so
 * there is no row left to be in — everything is a direct child of the same
 * 1440px container, and the grid measures itself against the page.
 */
export default function PlpClient({
  category,
  products,
  initialState,
  user,
}: {
  category: ShopCategory;
  products: PlpProduct[];
  initialState: FilterState;
  user?: HomepageUser | null;
}) {
  const config = getFilterConfig(category.audience);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    state,
    products: visibleProducts,
    total,
    counts,
    activeChips,
    isFiltered,
    toggleFacet,
    isFacetActive,
    setPriceRange,
    setSort,
    toggleQuickChip,
    isPatchActive,
    clearAll,
  } = usePlpFilters(products, config, category, initialState);

  // Has the shopper touched a filter yet? The grid uses this to drop its
  // staggered card entry after the first interaction — see PlpProductGrid.
  // Adjusted during render (React's documented derive-from-props pattern), so
  // the grid knows on the same render the new results arrive.
  const [seenState, setSeenState] = useState(state);
  const [interacted, setInteracted] = useState(false);
  if (seenState !== state) {
    setSeenState(state);
    setInteracted(true);
  }

  const isKids = category.audience === 'kids';
  // "Kids · Toddler" — the qualifier only reads well on the sub-categories.
  const qualifier = category.breadcrumb.at(-1)?.label === 'Kids' ? 'Kids' : undefined;

  return (
    <main className="min-h-screen px-4 pt-8 pb-32 md:px-12">
      <div className="mx-auto max-w-[1440px]">
        <PlpBackLink parent={category.breadcrumb.at(-1)} />

        <PlpBreadcrumb trail={category.breadcrumb} current={category.label} />

        <PlpHeader
          title={category.label}
          qualifier={qualifier}
          description={category.description}
          count={total}
        />

        <CategoryNavigation audience={category.audience} />

        <PlpToolbar
          activeCount={activeChips.length}
          sorts={config.sorts}
          sort={state.sort}
          onSortChange={setSort}
          onOpenFilters={() => setDrawerOpen(true)}
        />

        {/* The panel renders nothing inline — it is a drawer at every width, so
            it takes no space in the flow and the grid below gets the container's
            full width instead of sharing a flex row with a 260px column. */}
        <PlpFilterPanel
          config={config}
          counts={counts}
          isFacetActive={isFacetActive}
          toggleFacet={toggleFacet}
          minPrice={state.minPrice}
          maxPrice={state.maxPrice}
          setPriceRange={setPriceRange}
          isFiltered={isFiltered}
          clearAll={clearAll}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          quickChips={config.quickChips}
          isQuickChipActive={isPatchActive}
          onToggleQuickChip={toggleQuickChip}
        />

        {/* ── Kids: Shop by Colour ──
            Kept on the page rather than moved into the drawer: it is a visual
            browse rail with swatches, not a facet list, and it is one of the
            things that makes the Kids storefront feel like itself. */}
        {isKids && config.colorRail && (
          <ShopByColorRail
            colors={config.colorRail}
            counts={counts}
            isActive={(value) => isFacetActive('colors', value)}
            onToggle={(value) => toggleFacet('colors', value)}
          />
        )}

        {isKids && FUTURE_FEATURES.sizeAgePredictor && <SizeAgePredictor />}
        {isKids && FUTURE_FEATURES.familyMatchingBundle && <FamilyMatchingBundle />}

        {/* Only what the shopper actually chose stays on the page. An empty
            filter state now shows no chip row at all, so the grid starts
            directly under the toolbar. */}
        {activeChips.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <div className="min-w-0 flex-1">
              <ActiveFilterChips chips={activeChips} onClearAll={clearAll} />
            </div>
            {FUTURE_FEATURES.giftFinder && <GiftFinderEntry />}
          </div>
        )}

        <PlpProductGrid
          products={visibleProducts}
          user={user}
          stagger={!interacted}
          onClearAll={clearAll}
          isFiltered={isFiltered}
          // The trail's last stop is this category's parent — Shop, or Kids
          // for the age and gender pages — so a scoped page with no stock
          // still offers a way onward.
          fallback={category.breadcrumb.at(-1)}
        />

        {FUTURE_FEATURES.recentlyViewed && <RecentlyViewed products={[]} user={user} />}
      </div>
    </main>
  );
}
