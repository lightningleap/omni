import type { SharedHomepageContent } from './types';

/**
 * Content that both modes render identically.
 *
 * The mailing list is genuinely audience-neutral — one list, both audiences — so
 * it deliberately ignores the selected mode. Keeping its copy here (rather than
 * in a mode file) makes that "shared, never switches" contract explicit and stops
 * it drifting into the per-mode files by accident.
 *
 * Browse Collections USED to live here, and that was a bug in the content model
 * rather than a saving: it meant Kids shoppers were offered Witchy & Gothic and
 * Feminist & Unfiltered. Each mode now owns its own category list — see
 * `browseCollections` in `adultHomepage.ts` / `kidsHomepage.ts`.
 */
export const sharedHomepage: SharedHomepageContent = {
  newsletter: {
    label: 'Studio Notes',
    title: 'New Designs, Straight From the Desk',
    subtitle: 'Join our mailing list and get 10% off your first order.',
    placeholder: 'Your email address',
    submitLabel: 'Subscribe',
  },

  collectionsMenuLabel: 'Collections',
};
