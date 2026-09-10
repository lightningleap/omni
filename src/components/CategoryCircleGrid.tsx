"use client";

import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent, type MouseEvent as ReactMouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  handle: string;
  imageUrl?: string | null;
}

// ── Card geometry ──────────────────────────────────────────────────────────
// The circles are untouched (100px / 120px) and so is the distance between
// them. What changed is where that distance comes from: the card is now wider
// than its circle, and the track's gutter shrinks by exactly what the card
// gained — 12px of card padding on each side plus a 12px gutter is the same
// 36px between circles that a 104px card and a 32px gutter used to give, and
// 144 + 16 reproduces the desktop 40px identically. The extra width is there
// for the title, not for the image.
//
// TITLE_BOX is narrower than the card on purpose, and identical at every
// breakpoint so a name wraps the same way on a phone as on a desktop. Its width
// is what decides where long names break, so it is measured against the titles
// as actually rendered — and it has to move with the type size. At 14px/500 the
// window is:
//   • ≥ 88.6px ("Home & Desk") so short names stay on one line
//   • ≥ 75.3px ("French with") so no name is pushed to a third line
//   • < 104.2px ("Totes and Travel") so the long names break where a designer
//     would break them — "Totes and / Travel Bags", not "Totes and Travel /
//     Bags" with one word stranded underneath
// 96px sits mid-window, so small font-metric differences can't flip a wrap.
const CARD = 'w-[124px] md:w-[144px]';
const TRACK_GAP = 'gap-x-3 md:gap-x-4';
const TITLE_BOX = 'w-[96px]';
// Deliberately unchanged at 42px even though the type got smaller: the box is
// what holds every card — and so the whole section — at a constant height, and
// shrinking it to fit the new size would move the hero and everything under it.
// Two 14px lines occupy 36px of it and sit centred in the rest.
const TITLE_HEIGHT = 'h-[42px]';

// Same floating glass control used by the other horizontal carousels.
const ARROW =
  "hidden md:flex absolute top-1/2 -translate-y-1/2 z-30 h-11 w-11 items-center justify-center rounded-full bg-white/75 backdrop-blur-[16px] border border-white/70 text-accent-ink shadow-[0_10px_30px_rgb(var(--accent-shade-rgb)/0.08)] transition-[background-color,color,transform,box-shadow] duration-200 ease-out hover:bg-accent hover:text-accent-on hover:scale-105 hover:shadow-[0_14px_34px_rgb(var(--accent-shade-rgb)/0.18)] active:scale-95";

const FALLBACK = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80';

// Auto-scroll speed (px per frame ≈ 36px/s at 60fps) — gentle and premium.
const SPEED = 0.6;

/**
 * Premium circular category navigator — a single row that scrolls continuously
 * and loops seamlessly (never dead-ends). The list is duplicated; the auto-scroll
 * wraps at the halfway point so it flows on forever. Pauses on hover / touch so
 * the arrows and manual swipe stay usable; wrap logic keeps manual scroll infinite
 * too. Motion is scrollLeft only (compositor-friendly) and respects reduced motion.
 */
export default function CategoryCircleGrid({
  collections,
  audience,
}: {
  collections: Collection[];
  /**
   * The storefront the shopper is in, appended to every circle's href.
   *
   * Without it the rail linked to a bare `/collections/<handle>`, and that page
   * defaults a missing `audience` to ADULT — deliberately, so a mixed grid never
   * paints. The consequence was that every KIDS circle asked for Kids themes out
   * of the Adult catalogue and got nothing back. `pickCollections` has always
   * appended this for the three featured cards; the rail simply never did.
   */
  audience?: string;
}) {
  const items = collections.slice(0, 18);
  const trackRef = useRef<HTMLDivElement>(null);
  /*
   * `captured` is tracked because pointer capture is now taken LATE — see
   * `onDragMove`. Releasing a capture that was never taken throws, so the flag
   * is what `onDragEnd` checks rather than `down`.
   */
  const dragRef = useRef({ down: false, startX: 0, startScroll: 0, moved: false, captured: false });

  // Why the row pauses is tracked per reason rather than as one flag. A single
  // `paused` boolean has to be un-set by whichever handler happens to fire last,
  // and the drag handlers could not: releasing the mouse cleared the drag but
  // left the row paused, and with the pointer captured the matching mouseleave
  // never arrived to clear it either — so one drag stopped the carousel for
  // good. Each reason now clears itself, and the row runs when none is set.
  const hoverRef = useRef(false);
  const dragPausedRef = useRef(false);
  const touchRef = useRef(false);
  const isPaused = () => hoverRef.current || dragPausedRef.current || touchRef.current;

  // The distance after which the second copy is exactly where the first was —
  // i.e. one full list, gutters included. NOT scrollWidth / 2: the track carries
  // horizontal padding (px-1 / md:px-8) that belongs to neither copy, so half
  // the scroll width overshoots one list by that padding and the wrap lands
  // 24px off, which reads as a small jolt on every lap. Measured off two real
  // cards a list apart, so it stays exact at any breakpoint.
  const periodRef = useRef(0);

  // Duplicate the list so the second copy trails the first for a seamless loop.
  const loop = items.length ? [...items, ...items] : [];

  const measurePeriod = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>('[data-circle-card]');
    periodRef.current =
      cards.length > items.length
        ? cards[items.length].offsetLeft - cards[0].offsetLeft
        : el.scrollWidth / 2;
  }, [items.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    measurePeriod();
    // Card widths are breakpoint-dependent, so the period changes with the
    // viewport — re-measure rather than trusting the first reading.
    const ro = new ResizeObserver(measurePeriod);
    ro.observe(el);

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return () => ro.disconnect(); // honour reduced motion

    let raf = 0;
    const step = () => {
      if (!isPaused()) {
        const period = periodRef.current;
        if (period > 0) {
          el.scrollLeft += SPEED;
          if (el.scrollLeft >= period) el.scrollLeft -= period; // seamless wrap
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [loop.length, measurePeriod]);

  // Keep manual swipe / arrow scrolling infinite as well.
  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const period = periodRef.current;
    if (period > 0 && el.scrollLeft >= period) el.scrollLeft -= period;
  };

  // ~3–4 categories per arrow click.
  const scroll = (dir: 1 | -1) =>
    trackRef.current?.scrollBy({ left: dir * 480, behavior: 'smooth' });

  // ── Click-and-drag to scroll (mouse only — touch keeps native swipe) ──
  const onDragStart = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const el = trackRef.current;
    if (!el) return;
    dragRef.current = { down: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false, captured: false };
    dragPausedRef.current = true;
    /*
     * NO `setPointerCapture` HERE — and this is the whole bug.
     *
     * Capturing on pointerdown retargets the pointer stream to this track, and
     * the browser's COMPATIBILITY MOUSE EVENTS go with it. `click` is dispatched
     * to the common ancestor of the mousedown and mouseup targets, so with both
     * retargeted here that ancestor is the track — never the <a> the pointer is
     * actually over. Every circle rendered a correct href, and clicking one did
     * nothing at all.
     *
     * It only bit a mouse, because the handler returns early for touch and pens,
     * so the rail worked on a phone and was dead on a desktop.
     *
     * Capture is taken in `onDragMove` instead, at the moment a real drag is
     * recognised. A click never reaches that point, so it stays a click.
     */
  };
  const onDragMove = (e: ReactPointerEvent) => {
    const d = dragRef.current;
    if (!d.down) return;
    const el = trackRef.current;
    if (!el) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > 4) {
      d.moved = true;
      // A genuine drag: take the pointer now, so it keeps tracking even if the
      // cursor leaves the rail mid-throw. This is what pointerdown used to do.
      el.setPointerCapture?.(e.pointerId);
      d.captured = true;
    }
    const period = periodRef.current;
    let target = d.startScroll - dx;
    if (period > 0) {
      // wrap in both directions so dragging never dead-ends
      if (target < 0) { target += period; d.startScroll += period; }
      else if (target >= period) { target -= period; d.startScroll -= period; }
    }
    el.scrollLeft = target;
  };
  const onDragEnd = (e: ReactPointerEvent) => {
    if (dragRef.current.captured) {
      trackRef.current?.releasePointerCapture?.(e.pointerId);
      dragRef.current.captured = false;
    }
    dragRef.current.down = false;
    // Hand the row back: if the pointer is still over it, hover keeps it paused
    // and releases on the way out. Without this the carousel never restarted.
    dragPausedRef.current = false;
  };
  // Swallow the click that fires right after a drag so it doesn't navigate.
  const onClickCapture = (e: ReactMouseEvent) => {
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current.moved = false;
    }
  };

  if (!items.length) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => { hoverRef.current = true; }}
      onMouseLeave={() => { hoverRef.current = false; }}
      /* Pointer events fire reliably even while the track has the pointer
         captured mid-drag, where the mouse pair can be swallowed — so the row
         always learns that the cursor has gone and starts moving again. */
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') hoverRef.current = true; }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') hoverRef.current = false; }}
    >
      <button aria-label="Previous categories" onClick={() => scroll(-1)} className={`${ARROW} left-0`}>
        <ChevronLeft size={20} strokeWidth={2.25} />
      </button>
      <button aria-label="Next categories" onClick={() => scroll(1)} className={`${ARROW} right-0`}>
        <ChevronRight size={20} strokeWidth={2.25} />
      </button>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        onTouchStart={() => { touchRef.current = true; }}
        onTouchEnd={() => { touchRef.current = false; }}
        onTouchCancel={() => { touchRef.current = false; }}
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
        onClickCapture={onClickCapture}
        className="no-scrollbar cursor-grab select-none overflow-x-auto px-1 active:cursor-grabbing md:px-8"
      >
        <div className={`flex w-max py-2 ${TRACK_GAP}`}>
          {loop.map((c, i) => {
            const isClone = i >= items.length;
            return (
              <Link
                key={`${c.id}-${i}`}
                href={audience ? `/collections/${c.handle}?audience=${audience}` : `/collections/${c.handle}`}
                aria-label={`Shop ${c.name}`}
                aria-hidden={isClone || undefined}
                tabIndex={isClone ? -1 : undefined}
                /* Read by measurePeriod: the offset between this card and its
                   clone one list along is the exact seamless-wrap distance. */
                data-circle-card
                className={`group flex flex-col items-center focus-visible:outline-none ${CARD}`}
              >
                <div className="relative h-[100px] w-[100px] overflow-hidden rounded-full bg-neutral-100 shadow-[0_4px_14px_-6px_rgba(20,20,25,0.18)] ring-1 ring-black/[0.04] transition-[transform,box-shadow,filter] duration-[220ms] ease-out group-hover:-translate-y-1 group-hover:scale-[1.05] group-hover:shadow-[0_12px_26px_-8px_rgba(20,20,25,0.28)] group-hover:brightness-[1.04] group-focus-visible:ring-2 group-focus-visible:ring-accent group-focus-visible:ring-offset-2 md:h-[120px] md:w-[120px] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:scale-100">
                  <Image
                    src={c.imageUrl || FALLBACK}
                    alt={c.name}
                    fill
                    loading="lazy"
                    draggable={false}
                    sizes="120px"
                    className="object-cover"
                  />
                </div>
                {/* Fixed-height, centred title area. Every card reserves this
                    same block whether the name takes one line or two, so the
                    circles above it stay on one axis and the row reads as a
                    grid rather than a ragged set of columns. */}
                <div className={`mt-3 flex items-center justify-center ${TITLE_HEIGHT} ${TITLE_BOX}`}>
                  <span className="text-center text-[14px] font-medium leading-[1.28] tracking-[0.01em] text-ink transition-colors duration-[220ms] ease-out group-hover:text-accent-ink">
                    {c.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
