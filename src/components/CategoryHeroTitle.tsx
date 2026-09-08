"use client";

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Editorial category hero title.
 *
 * Renders titles like "Adult · Women's" at the H2 display step (Mellos Regular,
 * fluid 30→48px, -0.02em). The audience qualifier is set in caps and the category
 * in title case, so the two parts stay distinguishable without a second typeface
 * — the whole title is one editorial voice. Set in the accent scale's darkest
 * step (`text-accent-950`), so it follows the storefront it is rendered in, with
 * a soft blur-in on load.
 *
 * WHY H2 AND NOT H1: `.type-h1` (44→88px) is the homepage HERO step — a headline
 * with a full-bleed image behind it and nothing above it. A listing page is a
 * different job: the title sits over a breadcrumb, a count, a filter bar and a
 * grid, and at 88px it dwarfed all of them and pushed the first row of products
 * below the fold. The type scale already names the step this wants —
 * `--type-h2-*` is documented as "standalone / page-level display headings" —
 * so this is the system's own answer, not a smaller guess. The element stays an
 * <h1> because it is still the page's title; only the visual step changes.
 *
 * The <h1> keeps the full title as real text (casing is presentational only),
 * so SEO and screen-reader output are unchanged.
 */
const EASE = [0.22, 0.61, 0.36, 1] as const;

export default function CategoryHeroTitle({ title }: { title: string }) {
  const parts = title.split('·').map((s) => s.trim()).filter(Boolean);
  const hasQualifier = parts.length >= 2;
  const first = hasQualifier ? parts[0] : null;
  const rest = hasQualifier ? parts.slice(1).join(' · ') : title;

  return (
    <motion.h1
      initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: EASE }}
      className="type-h2 text-accent-950"
    >
      {first && (
        <>
          <span className="uppercase">{first}</span>
          <span className="mx-2 align-middle text-accent-950/40 md:mx-3">·</span>
        </>
      )}
      <span>{rest}</span>
    </motion.h1>
  );
}
