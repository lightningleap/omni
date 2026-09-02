"use client";

import { useMemo, useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_HOMEPAGE_MODE,
  getHomepageContent,
  type HomepageContent,
  type HomepageMode,
} from '@/data/homepage';
import { getBrandPresence, type BrandPresence } from '@/data/brand';

export type { HomepageMode };

/**
 * Storefront mode — the single source of truth for Adult vs Kids.
 *
 * Zustand + `persist` matches the cart and wishlist stores, so the selection
 * survives a refresh and a return visit (localStorage, no cookie needed — the
 * mode is a client-side preference and never has to reach the server).
 *
 * Nothing prop-drills: any client component calls `useHomepageMode()` and
 * subscribes to exactly the slice it needs.
 */
interface HomepageModeState {
  mode: HomepageMode;
  setMode: (mode: HomepageMode) => void;
  toggleMode: () => void;
}

export const useHomepageModeStore = create<HomepageModeState>()(
  persist(
    (set, get) => ({
      mode: DEFAULT_HOMEPAGE_MODE,

      // Guarded so re-selecting the active mode is a no-op — a bare `set` would
      // still notify every subscriber and re-render the whole homepage.
      setMode: (mode) => {
        if (get().mode !== mode) set({ mode });
      },

      toggleMode: () => set({ mode: get().mode === 'adult' ? 'kids' : 'adult' }),
    }),
    {
      name: 'unrwly-homepage-mode',
      // Only the selection is worth persisting.
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);

const NEVER_CHANGES = () => () => {};

/**
 * False while the server tree is being hydrated, true from then on.
 *
 * The server has no localStorage, so it always renders the default (Adult)
 * mode. `persist` rehydrates synchronously at import time on the client, so a
 * returning Kids visitor's stored mode would otherwise be applied on React's
 * *first* client render — the two trees would disagree and React would throw a
 * hydration mismatch (and blow away the server HTML).
 *
 * `useSyncExternalStore` is the sanctioned way to say "this value differs
 * between server and client": React uses the third argument for the hydration
 * pass and the second one after, so the swap lands as an ordinary post-hydration
 * update — which is exactly what the mode crossfade animates. No effect, no
 * cascading render.
 */
function useMounted() {
  return useSyncExternalStore(
    NEVER_CHANGES,
    () => true,
    () => false
  );
}

export interface HomepageModeApi {
  mode: HomepageMode;
  setMode: (mode: HomepageMode) => void;
  toggleMode: () => void;
  isAdult: boolean;
  isKids: boolean;
  /** False during the first (server-matching) render. */
  hydrated: boolean;
}

/** Read + control the storefront mode. */
export function useHomepageMode(): HomepageModeApi {
  const storedMode = useHomepageModeStore((state) => state.mode);
  const setMode = useHomepageModeStore((state) => state.setMode);
  const toggleMode = useHomepageModeStore((state) => state.toggleMode);
  const mounted = useMounted();

  const mode = mounted ? storedMode : DEFAULT_HOMEPAGE_MODE;

  return useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
      isAdult: mode === 'adult',
      isKids: mode === 'kids',
      hydrated: mounted,
    }),
    [mode, setMode, toggleMode, mounted]
  );
}

/**
 * The active mode's content bundle. Sections use this instead of importing a
 * data file directly, so they stay mode-agnostic.
 */
export function useHomepageContent(): HomepageContent {
  const { mode } = useHomepageMode();
  return useMemo(() => getHomepageContent(mode), [mode]);
}

/**
 * The active mode's real Etsy record — stats, reviews and social profiles.
 *
 * Same contract as `useHomepageContent`: the trust sections read this instead of
 * importing a shop's data directly, which is what guarantees Adult figures can
 * never render while Kids is selected. See `data/brand/presence.ts`.
 */
export function useBrandPresence(): BrandPresence {
  const { mode } = useHomepageMode();
  return useMemo(() => getBrandPresence(mode), [mode]);
}
