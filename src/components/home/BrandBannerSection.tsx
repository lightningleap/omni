"use client";

import Image from 'next/image';
import { useHomepageMode } from '@/store/useHomepageMode';
import type { HomepageMode } from '@/data/homepage';

/** One mode's brand plate, resolved on the server (see `getBrandBanners`). */
export interface BrandBanner {
  src: string;
  /** The file's real pixel size — the plate renders at its own aspect ratio. */
  width: number;
  height: number;
  /** Short landmark label for assistive tech. */
  label: string;
  alt: string;
}

/** Artwork per mode. A mode with no entry simply renders no plate. */
export type BrandBannerMap = Partial<Record<HomepageMode, BrandBanner>>;

/**
 * The UNRWLY brand banner — the full-width plate that sits between the header
 * and the hero.
 *
 * ONE PER MODE. Adult shows the UNRWLY lockup, Kids shows the UNRWLY KIDS one.
 * They are mutually exclusive by construction rather than by two components
 * each guarding themselves: this reads the selected mode and renders that mode's
 * artwork, so there is no arrangement of state in which both appear, and adding
 * a third mode later is a data change, not a new component.
 *
 * A mode with no artwork on disk renders nothing at all — no wrapper, no
 * spacing — so its homepage opens on the hero exactly as it did before.
 *
 * ── HOW IT IS SIZED ─────────────────────────────────────────────────────────
 * Full-bleed width, and never taller than 380px.
 *
 * `h-auto max-h-[380px]` rather than a flat `h-[380px]`, because the two behave
 * very differently on a narrow screen. A flat height would force the artwork to
 * cover a box far wider than it is tall, and `object-cover` would crop it
 * HORIZONTALLY — on a phone that eats the ends of the wordmark. The cap instead
 * lets the plate keep its own aspect ratio until that ratio would exceed 380px,
 * and only then holds the height and crops the top and bottom, which this
 * artwork survives because the lockup is centred with grid above and below it.
 *
 * The two behaviours meet exactly at the width where the natural height IS
 * 380px, so there is no jump at any viewport size — and no breakpoint here
 * hard-codes an aspect ratio, so replacing either asset with a differently
 * shaped one still needs no code change. `getBrandBanners` reads each file's
 * real pixel size off disk, which is what keeps `width`/`height` honest.
 *
 * `priority` because it is the first thing above the fold and would otherwise
 * compete with the hero for the LCP.
 */
export default function BrandBannerSection({ banners }: { banners: BrandBannerMap }) {
  const { mode } = useHomepageMode();
  const banner = banners[mode];

  if (!banner) return null;

  return (
    <section aria-label={banner.label} className="w-full bg-white">
      <Image
        // Keyed by source so switching modes mounts a fresh element rather than
        // swapping `src` on the existing one — which would briefly paint the
        // outgoing artwork inside the incoming one's aspect-ratio box.
        key={banner.src}
        src={banner.src}
        alt={banner.alt}
        width={banner.width}
        height={banner.height}
        priority
        sizes="100vw"
        className="h-auto max-h-[380px] w-full object-cover object-center"
      />
    </section>
  );
}
