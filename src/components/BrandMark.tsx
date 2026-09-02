"use client";

import { useHomepageMode, type HomepageMode } from '@/store/useHomepageMode';

/**
 * The UNRWLY logo — one component, used everywhere the brand appears.
 *
 * Desktop header, mobile drawer and footer previously each hand-rolled their own
 * wordmark, which is how they had drifted apart (the footer had lost the accent
 * dot entirely). They now render this, so the mark is identical across the site
 * and there is exactly one place to change it.
 *
 * ── THE MARK TAKES THE ACCENT COLOUR, IT DOES NOT CARRY ONE ─────────────────
 * The logo used to be drawn as a plain <Image>, which meant its colour was
 * whatever was baked into the file's pixels: a #809B71 olive, against a #75AC95
 * mint accent. Close enough to look like a mistake, and impossible to fix
 * properly by editing CSS, because no stylesheet can reach inside a PNG.
 *
 * So the file is no longer painted — it is used as a STENCIL. The artwork's
 * alpha channel becomes a CSS mask and the fill comes from `currentColor`,
 * which this component sets to the accent token. The silhouette, its edges and
 * its anti-aliasing are the studio's file untouched; only the colour is ours.
 *
 * That makes the mismatch structurally impossible rather than merely fixed. The
 * logo cannot hold a colour of its own any more, so when the Kids storefront
 * re-declares `--accent-900` as #2BF6C5 the mark follows in the same repaint as
 * every button and chip on the page. There is no logo colour to keep in sync.
 *
 * ── THE FILES ───────────────────────────────────────────────────────────────
 * `public/brand/unrwly-logo.png` is the studio's mark and remains the file to
 * replace. `unrwly-logo-mask.png` is derived from it — same pixels, same alpha,
 * colour planes discarded so it weighs 33 KB instead of 225 KB. Regenerate it
 * with `node scripts/build-logo-mask.mjs` after dropping in new artwork.
 *
 * If the logo is ever supplied as an SVG, none of this is needed: point
 * LOGO_MASK at the .svg (it masks just as well) or, better, inline it and give
 * its paths `fill="currentColor"`.
 *
 * ── THE KIDS STOREFRONT HAS ITS OWN MARK, AND IT IS STENCILLED TWICE ────────
 * Kids is not the Adult mark in a different colour: it is a separate lockup —
 * a wordmark with a black "KIDS" script beside it. Two colours, which one mask
 * cannot draw, since a mask flattens artwork to a single colour by definition;
 * masking the whole lockup would paint the script the accent colour too.
 *
 * So it is cut in two along that line and drawn as two stencils stacked in one
 * box (`scripts/build-kids-logo.mjs` derives them, and proves their alpha
 * reassembles the source exactly). The wordmark's takes `currentColor` like the
 * Adult mark, so it IS `--accent-900` — not a copy of it, and not the #01CC83
 * the artwork was supplied in, which was a near-miss for the Kids accent and
 * exactly the kind of drift the stencil approach exists to make impossible. The
 * script's is filled with ink black, which is not a theme colour and does not
 * follow one; it is a stencil only so that both halves are drawn the same way.
 *
 * The two layers share one box and both letterbox with `contain`, so they
 * cannot fall out of register with each other whatever the box is rounded to.
 *
 * Which mark renders follows the storefront mode, so the swap costs the callers
 * nothing — the header, the drawer and the footer each render this and get the
 * right lockup. Placements that live outside the storefront chrome can pin one
 * by passing `mode`, which is also how the header keeps the mark in step with
 * an `?audience=` URL that outranks the persisted selection.
 *
 * The mode is only known after hydration (it lives in localStorage), so the
 * server renders Adult and Kids arrives in the same post-hydration swap as the
 * accent colour — see StorefrontTheme.
 */
const LOGO_MASK: string | null = '/brand/unrwly-logo-mask.png';

/** Intrinsic width ÷ height of the mark. Only read when LOGO_MASK is set. */
const LOGO_ASPECT = 1202 / 391;

/**
 * The Kids lockup's two halves, each an alpha-only stencil cropped to the ink by
 * `node scripts/build-kids-logo.mjs` from the studio's `logo unrwly kids.png` —
 * same alpha, same edges, no artboard padding. Re-run that script after dropping
 * in new artwork and copy the aspect it prints into KIDS_LOGO_ASPECT.
 */
const KIDS_WORDMARK_MASK = '/brand/unrwly-kids-wordmark-mask.png';
const KIDS_SCRIPT_MASK = '/brand/unrwly-kids-script-mask.png';

/**
 * The "KIDS" script's ink.
 *
 * A literal, and deliberately not a token: the script is black in the artwork
 * and stays black on both storefronts. Everything the accent governs goes
 * through `currentColor` instead — see `tone`.
 */
const KIDS_SCRIPT_INK = '#000000';

/**
 * 2059 ÷ 464, the trimmed file's own dimensions.
 *
 * Wider than the Adult mark's 3.07 because of the "KIDS" script on the right —
 * and the reason the HEIGHT map below is shared rather than forked: at the same
 * rendered height the two lockups' wordmarks come out the same size (the Kids
 * wordmark alone is 3.17:1), so the mark does not appear to grow or shrink when
 * the storefront toggle is flipped. Only the script's extra width arrives.
 */
const KIDS_LOGO_ASPECT = 2059 / 464;

/**
 * The CSS that turns an alpha channel into a shape.
 *
 * Prefixed and unprefixed: Safari below 15.4 and older Chromium only understand
 * -webkit-. `contain` letterboxes rather than distorts, so the sub-pixel
 * rounding on the box's width can never stretch the artwork.
 */
const stencil = (file: string): React.CSSProperties => {
  const url = `url(${file})`;

  return {
    WebkitMaskImage: url,
    maskImage: url,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    // The artwork's transparency is the stencil, not its lightness.
    maskMode: 'alpha',
  };
};

export type BrandMarkSize = 'sm' | 'md' | 'lg';

/**
 * Rendered height per placement, in px. The wordmark's font size is tuned to
 * sit on the same optical height, so swapping in the asset doesn't move the
 * surrounding layout.
 */
const HEIGHT: Record<BrandMarkSize, number> = {
  sm: 26, // desktop header
  md: 32, // mobile drawer
  lg: 44, // footer
};

const WORDMARK_SIZE: Record<BrandMarkSize, string> = {
  sm: 'text-[22px]',
  md: 'text-2xl',
  lg: 'text-4xl',
};

/** The accent dot scales with the wordmark and sits on its baseline. */
const DOT: Record<BrandMarkSize, string> = {
  sm: 'mb-[5px] ml-1 h-[7px] w-[7px]',
  md: 'mb-[6px] ml-1 h-2 w-2',
  lg: 'mb-[9px] ml-1.5 h-2.5 w-2.5',
};

interface BrandMarkProps {
  size?: BrandMarkSize;
  /**
   * Which storefront's mark to draw. Defaults to the active mode, which is what
   * every placement in the site chrome wants; pass it explicitly only where a
   * different value already governs the surrounding UI (the header, on an
   * `?audience=`-scoped route).
   */
  mode?: HomepageMode;
  /**
   * Which colour the mark takes.
   *
   * `accent` — the storefront's accent token, and the reason this prop is a
   * closed set rather than a free className: the mark's colour is not a local
   * styling decision, it is the theme's. `inherit` leaves it on the surrounding
   * `color`, for a placement that needs a reversed mark on a dark ground.
   */
  tone?: 'accent' | 'inherit';
  /** Layout/positioning classes for the mark. Colour belongs in `tone`. */
  className?: string;
  /** Accent-dot classes, for placements that recolour it on hover. */
  dotClassName?: string;
}

export default function BrandMark({
  size = 'sm',
  mode,
  tone = 'accent',
  className = '',
  dotClassName = '',
}: BrandMarkProps) {
  const height = HEIGHT[size];
  const { mode: storeMode } = useHomepageMode();

  // `text-accent` resolves to var(--accent-900) — the same property every
  // button, chip and badge on the page reads, so there is one value, not two.
  const toneClass = tone === 'accent' ? 'text-accent' : '';

  if ((mode ?? storeMode) === 'kids') {
    return (
      <span
        role="img"
        aria-label="UNRWLY Kids"
        style={{ height, width: Math.round(height * KIDS_LOGO_ASPECT) }}
        className={`relative inline-block shrink-0 ${toneClass} ${className}`}
      >
        {/* The wordmark. `currentColor`, so its colour is whatever `toneClass`
            resolves to — the Kids accent token on the storefront, or the
            surrounding text colour where a placement asks to inherit. */}
        <span
          aria-hidden="true"
          style={{ ...stencil(KIDS_WORDMARK_MASK), backgroundColor: 'currentColor' }}
          className="absolute inset-0"
        />
        {/* The "KIDS" script, in its own ink and unaffected by the theme. */}
        <span
          aria-hidden="true"
          style={{ ...stencil(KIDS_SCRIPT_MASK), backgroundColor: KIDS_SCRIPT_INK }}
          className="absolute inset-0"
        />
      </span>
    );
  }

  if (LOGO_MASK) {
    return (
      <span
        role="img"
        aria-label="UNRWLY"
        style={{
          height,
          width: Math.round(height * LOGO_ASPECT),
          // The colour. `currentColor` rather than a literal so the value comes
          // from `toneClass` — and therefore from the accent token.
          backgroundColor: 'currentColor',
          // The shape.
          ...stencil(LOGO_MASK),
        }}
        className={`inline-block shrink-0 ${toneClass} ${className}`}
      />
    );
  }

  // Fallback wordmark — Manrope Black italic with the brand's accent dot. The
  // display face is reserved for editorial headings and never used for the mark.
  // `bg-accent` on the dot for the same reason as above: a hard-coded hex here
  // would be a second logo colour, free to drift from the one the site uses.
  return (
    <span
      className={`inline-flex items-end font-sans font-black uppercase italic tracking-tighter ${WORDMARK_SIZE[size]} ${toneClass} ${className}`}
    >
      Unrwly
      <span
        aria-hidden="true"
        className={`rounded-full bg-accent ${DOT[size]} ${dotClassName}`}
      />
    </span>
  );
}
