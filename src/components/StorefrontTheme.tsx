"use client";

import { useEffect } from 'react';
import { useHomepageMode } from '@/store/useHomepageMode';

/**
 * Publishes the selected storefront onto the document, as `data-storefront-mode`.
 *
 * ── WHAT IT IS FOR ──────────────────────────────────────────────────────────
 * The Adult and Kids storefronts share one design system and differ in exactly
 * one thing: the accent colour. That difference is expressed as CSS — `:root`
 * declares Adult's accent scale and `[data-storefront-mode="kids"]` re-declares
 * it as #2BF6C5 (see globals.css) — so the entire re-colour is one attribute
 * flip. No component reads the mode to pick a colour, no colour is passed as a
 * prop, and switching costs no re-render: the browser simply re-resolves the
 * cascade.
 *
 * ── WHY <html> AND NOT A WRAPPER DIV ────────────────────────────────────────
 * Several pieces of accented UI are portalled to the end of <body> rather than
 * rendered inside the page tree — the cart drawer, the search modal, the
 * newsletter modal, the mobile menu. A wrapper element would leave every one of
 * them on the Adult accent while the rest of the Kids storefront had changed.
 * The document element is the only ancestor all of them share.
 *
 * ── WHY AN EFFECT ───────────────────────────────────────────────────────────
 * The mode lives in localStorage, which the server cannot read, so the server
 * always renders Adult. Applying the stored mode during the first client render
 * would disagree with the server HTML and break hydration. This is the same
 * one-off post-hydration swap that `ModeFade` already animates for content —
 * the accent now follows the same rule, so the two land together rather than
 * the colour arriving a beat before or after the products it belongs to.
 *
 * Renders nothing.
 */
export default function StorefrontTheme() {
  const { mode } = useHomepageMode();

  useEffect(() => {
    document.documentElement.dataset.storefrontMode = mode;
  }, [mode]);

  return null;
}
