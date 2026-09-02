import type { FilterConfig } from '@/types/plp';
import { CURRENCY_SYMBOL, SHARED_SORTS } from './shared';

/**
 * ADULT filter experience.
 *
 * Pure configuration — no JSX, no logic. The panel, the chips and the engine all
 * read this, so re-merchandising the Adult PLPs (new sizes, a new design theme,
 * a different quick chip) is an edit to this file alone.
 */
export const adultFilters: FilterConfig = {
  audience: 'adult',

  groups: [
    {
      id: 'sizes',
      label: 'Size',
      control: 'chips',
      attribute: 'sizes',
      options: [
        { value: 'xs', label: 'XS' },
        { value: 's', label: 'S' },
        { value: 'm', label: 'M' },
        { value: 'l', label: 'L' },
        { value: 'xl', label: 'XL' },
        { value: 'xxl', label: 'XXL' },
        { value: '3xl', label: '3XL' },
      ],
    },
    {
      id: 'fits',
      label: 'Fit',
      control: 'list',
      attribute: 'fits',
      options: [
        { value: 'slim', label: 'Slim' },
        { value: 'regular', label: 'Regular' },
        { value: 'relaxed', label: 'Relaxed' },
        { value: 'oversized', label: 'Oversized' },
        { value: 'athleisure', label: 'Athleisure' },
      ],
    },
    {
      id: 'price',
      label: 'Price Range',
      control: 'price',
    },
    {
      id: 'colors',
      label: 'Colour',
      control: 'swatches',
      attribute: 'colors',
      options: [
        { value: 'black', label: 'Black', swatch: '#1A1A1A' },
        { value: 'white', label: 'White', swatch: '#F2F0EB', swatchBordered: true },
        { value: 'grey', label: 'Grey', swatch: '#9A9A96' },
        { value: 'beige', label: 'Beige', swatch: '#D8CBB4' },
        { value: 'navy', label: 'Navy', swatch: '#2F5646' },
        { value: 'olive', label: 'Olive', swatch: '#6E6B47' },
        { value: 'blue', label: 'Blue', swatch: '#3B6FD4' },
        { value: 'green', label: 'Green', swatch: '#4E9A5B' },
        { value: 'red', label: 'Red', swatch: '#C0473F' },
        { value: 'brown', label: 'Brown', swatch: '#7A5741' },
      ],
    },
    {
      id: 'categories',
      label: 'Category',
      control: 'list',
      attribute: 'categories',
      options: [
        { value: 't-shirts', label: 'T-Shirts' },
        { value: 'tank-tops', label: 'Tank Tops' },
        { value: 'hoodies', label: 'Hoodies' },
        { value: 'sweatshirts', label: 'Sweatshirts' },
        { value: 'oversized', label: 'Oversized' },
        { value: 'long-sleeve', label: 'Long Sleeve' },
      ],
    },
    {
      id: 'themes',
      label: 'Design Theme',
      control: 'list',
      attribute: 'themes',
      options: [
        { value: 'minimal', label: 'Minimal' },
        { value: 'graphic', label: 'Graphic' },
        { value: 'typography', label: 'Typography' },
        { value: 'anime', label: 'Anime' },
        { value: 'nature', label: 'Nature' },
        { value: 'vintage', label: 'Vintage' },
        { value: 'streetwear', label: 'Streetwear' },
      ],
    },
  ],

  quickChips: [
    { id: 'new', label: 'New', patch: { flag: 'new' } },
    { id: 'trending', label: 'Trending', patch: { flag: 'trending' } },
    { id: 'bestsellers', label: 'Best Sellers', patch: { flag: 'bestseller' } },
    { id: 'budget', label: `Under ${CURRENCY_SYMBOL}999`, patch: { maxPrice: 999 } },
    { id: 'oversized', label: 'Oversized', patch: { facet: { key: 'fits', value: 'oversized' } } },
    { id: 'graphic', label: 'Graphic', patch: { facet: { key: 'themes', value: 'graphic' } } },
  ],

  sorts: SHARED_SORTS,
};
