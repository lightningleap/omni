"use client";

import ProductCard from '@/components/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHorizontalRail } from '@/hooks/useHorizontalRail';
import type { HomepageProduct, HomepageUser } from '@/data/homepage';

/**
 * One category strip in the product feed — a heading and its own horizontal
 * product rail.
 *
 * ── WHAT CHANGED, AND WHAT DID NOT ──────────────────────────────────────────
 * The feed used to be one continuous grid of everything. It is now a run of
 * these: T-Shirts, Hoodies & Sweatshirts, Totes & Bags, Hats & Accessories,
 * Mugs. The CARD is untouched — same `ProductCard`, same imagery, name, price,
 * colour swatches, badge, wishlist, quick-add, hover crossfade and typography.
 * Only the grouping and the direction of travel changed.
 *
 * ── EACH STRIP SCROLLS ALONE ────────────────────────────────────────────────
 * Every section owns its own scroll container, so the categories are five
 * independent rails rather than one giant carousel with everything in it.
 * Nothing here can make the page scroll sideways: the overflow is on this
 * container, `overscroll-x-contain` stops the gesture chaining out to the
 * document, and the track sits inside the section's normal max-width container,
 * so the first card lines up with the heading above it.
 *
 * ── ROWS ────────────────────────────────────────────────────────────────────
 * `rows={1}` is a single line of products. `rows={2}` splits the list in half
 * and stacks two tracks INSIDE THE SAME scroll container — so the two rows move
 * together as one plane and can never scroll independently, and reading order
 * still runs left-to-right along row one and then along row two. Both tracks
 * declare identical column widths, so the cards stay in lockstep columns.
 *
 * ── CARD SIZING ─────────────────────────────────────────────────────────────
 * Desktop keeps the feed's existing card exactly: `calc(20% - 16px)` against a
 * 64px gutter, which is what the old grid drew. Four fit comfortably and the
 * fifth is left about half-visible at the right edge, which is the whole hint
 * that the strip goes on. Tablet keeps three, and a phone shows the same
 * card-and-a-bit rather than a squeezed multi-column grid.
 */

// Same floating glass control the site's other horizontal rails use.
const ARROW =
  "hidden md:flex absolute top-1/2 -translate-y-1/2 z-30 h-11 w-11 items-center justify-center rounded-full bg-white/75 backdrop-blur-[16px] border border-white/70 text-accent-ink shadow-[0_10px_30px_rgb(var(--accent-shade-rgb)/0.08)] transition-[background-color,color,transform,box-shadow,opacity] duration-200 ease-out hover:bg-accent hover:text-accent-on hover:scale-105 hover:shadow-[0_14px_34px_rgb(var(--accent-shade-rgb)/0.18)] active:scale-95 disabled:pointer-events-none disabled:opacity-30 disabled:shadow-none";

// Edge fades wash out to the warm off-white the whole site sits on, so the row
// reads as continuing past the container rather than being cut off.
const FADE_LEFT = 'linear-gradient(to right, var(--color-bg) 0%, rgba(248,246,242,0) 100%)';
const FADE_RIGHT = 'linear-gradient(to left, var(--color-bg) 0%, rgba(248,246,242,0) 100%)';

// Vertical breathing room *inside* the scroll port, cancelled by an equal
// negative margin. A scroll container clips at its padding edge, so without this
// the card's entrance animation (which starts 20px low) and its focus ring would
// be sliced off — and the clipped overflow would briefly make the port scrollable
// vertically. Net layout effect: zero.
const CLIP_HEADROOM = 'py-6 -my-6';

/**
 * Column widths, shared by both tracks of a two-row strip so their cards line up.
 *
 *   phone   ~1.8 cards — one card-and-a-bit, comfortably readable, clearly swipeable
 *   tablet   3 cards + a sliver
 *   desktop  4 cards + roughly half of the fifth, at the feed's original card width
 */
const TRACK =
  'grid grid-flow-col grid-rows-1 auto-cols-[calc(55%_-_10px)] gap-x-4 md:auto-cols-[calc(33.333%_-_26px)] md:gap-x-5 lg:auto-cols-[calc(20%_-_16px)] lg:gap-x-16';

/** One line of cards. Both rows of a two-row strip render one of these. */
function Row({
  products,
  user,
  startIndex,
}: {
  products: HomepageProduct[];
  user?: HomepageUser | null;
  /**
   * Where these cards sit in the whole feed. Passed straight through as the
   * card's `index`, which is what decides its entrance stagger and whether its
   * image is fetched with priority — so grouping the feed into sections does not
   * quietly turn 24 lazy images into 24 priority ones.
   */
  startIndex: number;
}) {
  return (
    <div className={TRACK}>
      {products.map((product, i) => (
        <div key={product._id ?? `${startIndex}-${i}`} data-rail-card className="snap-start">
          <ProductCard
            product={product}
            index={startIndex + i}
            user={user}
            // Derived server-side from real order history and publish dates — see
            // `deriveProductTags` in app/page.tsx. Undefined for most products,
            // which is the intended state: the badge means something because it
            // is not on everything.
            tag={product.tag}
          />
        </div>
      ))}
    </div>
  );
}

export default function ProductCategorySection({
  id,
  title,
  products,
  rows = 1,
  user,
  startIndex = 0,
}: {
  /**
   * The category's slug (e.g. `hoodies-and-sweatshirts`). Used for the heading's
   * element id, so it has to be a real identifier — the title is not, since
   * "Hoodies & Sweatshirts" would put spaces into an `aria-labelledby` value,
   * which is parsed as a space-separated list of ids.
   */
  id: string;
  /** The category heading, e.g. "Hoodies & Sweatshirts". */
  title: string;
  products: HomepageProduct[];
  /** 1 = a single line; 2 = two lines that scroll together. */
  rows?: 1 | 2;
  user?: HomepageUser | null;
  /** This strip's offset within the whole feed — see `Row`. */
  startIndex?: number;
}) {
  const { trackRef, overflows, canPrev, canNext, scroll, handlers } = useHorizontalRail({
    itemCount: products.length,
  });

  if (!products.length) return null;

  // Two rows: the first half on top, the second beneath it, so the strip still
  // reads left-to-right along each line. An odd count leaves the bottom row one
  // card short, which is what it should look like.
  const split = rows === 2 ? Math.ceil(products.length / 2) : products.length;
  const topRow = products.slice(0, split);
  const bottomRow = rows === 2 ? products.slice(split) : [];

  return (
    <section aria-labelledby={`category-${id}`} className="scroll-mt-24">
      {/* Heading — the site's existing section-title step, so a category reads as
          a quieter sibling of the feed's own header rather than as a new visual
          language. Colour is set inline to beat the global unlayered h1–h6 rule. */}
      <h3
        id={`category-${id}`}
        style={{ color: 'var(--color-ink)' }}
        className="type-section-title mb-5 md:mb-6"
      >
        {title}
      </h3>

      {/* `flow-root` establishes a block formatting context so the track's
          negative vertical margins (see CLIP_HEADROOM) can't collapse through
          this wrapper and drag the strip upward. It also keeps this box exactly
          as tall as the cards, which is what the arrows centre on. */}
      <div className="relative flow-root">
        {overflows && (
          <>
            <button
              type="button"
              aria-label={`Scroll ${title} backwards`}
              onClick={() => scroll(-1)}
              disabled={!canPrev}
              className={`${ARROW} left-0`}
            >
              <ChevronLeft size={20} strokeWidth={2.25} />
            </button>
            <button
              type="button"
              aria-label={`Scroll ${title} forwards`}
              onClick={() => scroll(1)}
              disabled={!canNext}
              className={`${ARROW} right-0`}
            >
              <ChevronRight size={20} strokeWidth={2.25} />
            </button>

            {/* Edge fades — the only hint on touch, where the arrows are hidden.
                Each is tied to the direction it points at, so neither shows
                against an edge you've already reached. */}
            <span
              aria-hidden
              style={{ backgroundImage: FADE_LEFT }}
              className={`pointer-events-none absolute inset-y-0 left-0 z-20 w-8 transition-opacity duration-200 ease-out md:w-12 ${canPrev ? 'opacity-100' : 'opacity-0'}`}
            />
            <span
              aria-hidden
              style={{ backgroundImage: FADE_RIGHT }}
              className={`pointer-events-none absolute inset-y-0 right-0 z-20 w-8 transition-opacity duration-200 ease-out md:w-12 ${canNext ? 'opacity-100' : 'opacity-0'}`}
            />
          </>
        )}

        {/* snap-proximity, not mandatory: mandatory snapping yanks a short wheel
            nudge or drag back to the card it started on, which reads as the row
            refusing to move. Arrow steps are card-width multiples, so they still
            land aligned. */}
        <div
          ref={trackRef}
          {...handlers}
          tabIndex={0}
          role="group"
          aria-label={`${title} products`}
          className={`no-scrollbar snap-x snap-proximity cursor-grab select-none overflow-x-auto overscroll-x-contain ${CLIP_HEADROOM} [-webkit-overflow-scrolling:touch] focus-visible:outline-none active:cursor-grabbing`}
        >
          {/* Both rows live in this one container, so they move as a single
              plane — scrolling one can never leave the other behind. */}
          <div className="flex flex-col gap-y-10">
            <Row products={topRow} user={user} startIndex={startIndex} />
            {bottomRow.length > 0 && (
              <Row products={bottomRow} user={user} startIndex={startIndex + topRow.length} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
