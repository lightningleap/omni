import type { CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Collection {
  id: string;
  name: string;
  handle: string;
  imageUrl?: string | null;
}

// ── Card geometry ──────────────────────────────────────────────────────────
// TITLE_BOX tracks the circle above it — same `w-full` and the same 156px cap —
// so a name is never set in a box narrower or wider than the image it labels,
// and it wraps identically at every breakpoint.
//
// 156px at the 13px step holds "Home & Desk" and "Vintage Botanical" on one
// line, and breaks the longest name where a designer would: "Totes and /
// Travel Bags", not "Totes and Travel / Bags" with one word stranded.
const TITLE_BOX = 'w-full max-w-[156px]';
// Fixed at 40px so every card — and therefore every row — is the same height
// whether a name takes one line or two. That is what keeps the circles on
// shared axes once a row wraps; two 13px lines occupy ~34px of it.
const TITLE_HEIGHT = 'h-[40px]';

const FALLBACK = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80';

/**
 * Browse Collections — the circular category navigator.
 *
 * ── IT USED TO DRIVE ITSELF, AND THAT WAS THE PROBLEM ───────────────────────
 * This was an infinite auto-scrolling carousel: the list was duplicated, a
 * requestAnimationFrame loop advanced `scrollLeft` every frame, and hover,
 * touch and drag each had to pause it. The 09/10 notes ask for it to be static,
 * and that is the right call for what this rail is — a complete, short index of
 * the shop. A moving one made a shopper chase the category they wanted, hid
 * half the list off-screen at any moment, and never told them how many there
 * were. A grid shows the whole set at once and holds still while it is read.
 *
 * Everything that machinery needed went with it: the cloned second copy (and
 * its `aria-hidden` duplicates), the RAF loop, the period measurement and
 * ResizeObserver, the reduced-motion branch, the arrows, and the pointer-drag
 * handlers. That last one was also carrying a real bug — it called
 * `setPointerCapture` on pointerdown, which retargets the compatibility mouse
 * events to the track, so `click` never reached the <a> and every circle was
 * dead to a mouse while still working on touch. There is no track to capture
 * to now, so it cannot come back.
 *
 * ── FULL WIDTH, WITH THE ROW SHAPE DERIVED FROM THE COUNT ───────────────────
 * This layout has been wrong in three different ways, and the reasons are worth
 * keeping so none of them gets reintroduced as a "fix".
 *
 * 1. `minmax(124px, max-content)` — `max-content` stops a track growing past
 *    the card, so eleven 124px tracks sat in a 1344px container with the slack
 *    falling outside them. Small circles strung thinly across the page.
 *
 * 2. Columns derived from the count AND the grid capped at `cols × 124px`. The
 *    stringing went; Kids' eight categories became a 496px block floating in
 *    the middle of a 1344px section. The cap was the fault here — not the
 *    derived count, which is the part that later turned out to be right.
 *
 * 3. `minmax(145px, 1fr)` at full width. Properly distributed at last, but the
 *    column count then followed the VIEWPORT, so twelve categories broke 8 + 4
 *    at 1440 and 7 + 5 at 1280 — a different ragged shape at every width, and
 *    never the even 6 + 6 that twelve items obviously want.
 *
 * So: the count decides the SHAPE, the section decides the WIDTH. `cols` is
 * `ceil(n / 2)` for a list long enough to need two rows, and `n` for a short
 * one that fits on a single line — twelve becomes 6 + 6, eight stays one row of
 * eight. Then `minmax(0, 1fr)` spreads those columns across the whole section:
 * no max-width, no `justify-content: center`. The section keeps the page's own
 * `max-w-[1440px] px-4 md:px-12`, so the first and last circles line up with
 * every other section's content edge.
 *
 * Adult at 1440: six columns of ~204px carrying 156px circles. Kids: eight of
 * ~147px. Both fill the row; neither is centred in dead space.
 *
 * Below `lg` the count gives way to a fixed ladder — 4 across on a tablet, 4 on
 * a small tablet, 3 on a phone — because six 50px circles across a 375px screen
 * is not a grid, it is a row of dots.
 */
export default function CategoryCircleGrid({
  collections,
  audience,
}: {
  collections: Collection[];
  /**
   * The storefront the shopper is in, appended to every circle's href.
   *
   * Without it the rail links to a bare `/collections/<handle>`, and that page
   * defaults a missing `audience` to ADULT — so every KIDS circle would ask the
   * Adult catalogue for Kids themes and get nothing back.
   */
  audience?: string;
}) {
  const items = collections.slice(0, 18);
  if (!items.length) return null;

  // Two even rows once a list is long enough to need them, one row when it is
  // not. Twelve → 6 (6 + 6); eight → 8 (a single row). Capped at 8 so a longer
  // list cannot squeeze the circles, and floored at 3 so a very short one does
  // not stretch them.
  const cols = Math.min(8, Math.max(3, items.length > 8 ? Math.ceil(items.length / 2) : items.length));

  return (
    <ul
      style={{ '--cols': cols } as CSSProperties}
      className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 lg:gap-x-6 lg:gap-y-10 lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
    >
      {items.map((c) => (
        <li key={c.id} className="flex justify-center">
          <Link
            href={audience ? `/collections/${c.handle}?audience=${audience}` : `/collections/${c.handle}`}
            aria-label={`Shop ${c.name}`}
            className="group flex w-full flex-col items-center focus-visible:outline-none"
          >
            {/* Sized by its COLUMN, not by a breakpoint: `w-full` fills the
                track and `aspect-square` keeps it a circle, so the only job the
                caps do is stop it outgrowing the design.

                That makes the size genuinely responsive — a ~96px circle in a
                3-across phone grid, ~150px on a tablet, 156px at desktop — with
                one rule instead of a value per breakpoint, and it can never
                render an oval. The caps sit below the track width on purpose:
                the difference is the breathing room between circles. */}
            <div className="relative aspect-square w-full max-w-[156px] overflow-hidden rounded-full bg-neutral-100 shadow-[0_4px_14px_-6px_rgba(20,20,25,0.18)] ring-1 ring-black/[0.04] transition-[transform,box-shadow,filter] duration-[220ms] ease-out group-hover:-translate-y-1 group-hover:scale-[1.05] group-hover:shadow-[0_12px_26px_-8px_rgba(20,20,25,0.28)] group-hover:brightness-[1.04] group-focus-visible:ring-2 group-focus-visible:ring-accent group-focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:scale-100">
              <Image
                src={c.imageUrl || FALLBACK}
                alt=""
                fill
                loading="lazy"
                draggable={false}
                sizes="(max-width: 768px) 33vw, 156px"
                className="object-cover"
              />
            </div>
            {/* Fixed-height, centred title area. Every card reserves this same
                block whether the name takes one line or two, so the circles
                above it stay on one axis and the grid reads as a grid rather
                than a ragged set of columns. */}
            <div className={`mt-3 flex items-center justify-center ${TITLE_HEIGHT} ${TITLE_BOX}`}>
              <span className="text-center text-[13px] font-medium leading-[1.3] tracking-[0.01em] text-ink transition-colors duration-[220ms] ease-out group-hover:text-accent-ink">
                {c.name}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
