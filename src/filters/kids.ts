import type { FilterConfig, FilterOption } from '@/types/plp';
import { KIDS_COLORS as KIDS_COLOR_DATA } from '@/data/kidsColors';
import { CURRENCY_SYMBOL, SHARED_SORTS } from './shared';

/**
 * KIDS filter experience — deliberately NOT the adult one.
 *
 * Two things make it its own: every size carries its age equivalent as a hint
 * (a parent shops by age, not by letter), and the palette is the bright,
 * playful set the "Shop by Colour" rail is built from.
 */

/**
 * The Colour facet and the Shop by Colour rail, projected from the shared
 * palette in `data/kidsColors.ts`. Derived rather than restated so the homepage
 * browse section and this filter can never disagree about which colours exist,
 * what they're called, or what slug a product is matched on.
 */
export const KIDS_COLORS: FilterOption[] = KIDS_COLOR_DATA.map((color) => ({
  value: color.slug,
  label: color.name,
  swatch: color.hex,
  swatchBordered: color.bordered,
}));

export const kidsFilters: FilterConfig = {
  audience: 'kids',

  groups: [
    {
      id: 'ageRanges',
      label: 'Age Range',
      control: 'chips',
      attribute: 'ageRanges',
      options: [
        { value: '0-2', label: '0–2' },
        { value: '3-5', label: '3–5' },
        { value: '6-8', label: '6–8' },
        { value: '9-12', label: '9–12' },
        { value: 'teen', label: 'Teen' },
      ],
    },
    {
      id: 'sizes',
      label: 'Size',
      control: 'chips',
      attribute: 'sizes',
      // Every size shows its age equivalent — the hint is rendered beneath the
      // label by the `chips` control, so no size-specific component is needed.
      options: [
        { value: '2t', label: '2T', hint: 'Ages 1–2' },
        { value: '3t', label: '3T', hint: 'Ages 2–3' },
        { value: '4t', label: '4T', hint: 'Ages 3–4' },
        { value: '5t', label: '5T', hint: 'Ages 4–5' },
        { value: 'xs', label: 'XS', hint: 'Ages 5–6' },
        { value: 's', label: 'S', hint: 'Ages 7–8' },
        { value: 'm', label: 'M', hint: 'Ages 9–10' },
        { value: 'l', label: 'L', hint: 'Ages 11–12' },
        { value: 'xl', label: 'XL', hint: 'Ages 13–14' },
      ],
    },
    {
      id: 'genders',
      label: 'Gender',
      control: 'list',
      attribute: 'genders',
      options: [
        { value: 'boys', label: 'Boys' },
        { value: 'girls', label: 'Girls' },
        { value: 'unisex', label: 'Unisex' },
      ],
    },
    {
      id: 'price',
      label: 'Price',
      control: 'price',
    },
    {
      id: 'colors',
      label: 'Colour',
      control: 'swatches',
      attribute: 'colors',
      options: KIDS_COLORS,
    },
    {
      id: 'fabrics',
      label: 'Fabric',
      control: 'list',
      attribute: 'fabrics',
      options: [
        { value: 'organic-cotton', label: 'Organic Cotton' },
        { value: 'cotton-blend', label: 'Cotton Blend' },
        { value: 'tagless', label: 'Tagless' },
        { value: 'soft-touch', label: 'Soft Touch' },
        { value: 'hypoallergenic', label: 'Hypoallergenic' },
      ],
    },
    {
      id: 'themes',
      label: 'Design Theme',
      control: 'list',
      attribute: 'themes',
      options: [
        { value: 'animals', label: 'Animals' },
        { value: 'dinosaurs', label: 'Dinosaurs' },
        { value: 'cars', label: 'Cars' },
        { value: 'princess', label: 'Princess' },
        { value: 'space', label: 'Space' },
        { value: 'nature', label: 'Nature' },
        { value: 'cartoons', label: 'Cartoons' },
        { value: 'educational', label: 'Educational' },
      ],
    },
  ],

  quickChips: [
    { id: 'new', label: 'New', patch: { flag: 'new' } },
    { id: 'trending', label: 'Trending', patch: { flag: 'trending' } },
    { id: 'bestsellers', label: 'Best Sellers', patch: { flag: 'bestseller' } },
    { id: 'budget', label: `Under ${CURRENCY_SYMBOL}499`, patch: { maxPrice: 499 } },
    { id: 'organic', label: 'Organic Cotton', patch: { facet: { key: 'fabrics', value: 'organic-cotton' } } },
    { id: 'animals', label: 'Animals', patch: { facet: { key: 'themes', value: 'animals' } } },
    { id: 'dinosaurs', label: 'Dinosaurs', patch: { facet: { key: 'themes', value: 'dinosaurs' } } },
    { id: 'rainbow', label: 'Rainbow', patch: { facet: { key: 'colors', value: 'rainbow' } } },
    { id: 'educational', label: 'Educational', patch: { facet: { key: 'themes', value: 'educational' } } },
  ],

  // Kids gets the shared sorts plus the two age orderings.
  sorts: [
    ...SHARED_SORTS,
    { value: 'age-asc', label: 'Age: Youngest → Oldest' },
    { value: 'age-desc', label: 'Age: Oldest → Youngest' },
  ],

  colorRail: KIDS_COLORS,
};
