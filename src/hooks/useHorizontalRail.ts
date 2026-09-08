"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

/**
 * The scroll behaviour every horizontal rail on the site shares.
 *
 * Lifted verbatim out of `CollectionCardRail`, which had grown the complete set
 * — native touch swipe, trackpad, mouse wheel redirected sideways,
 * click-and-drag, ←/→ once focused, and edge state for the arrows and fades —
 * and was the only place that had it. The product category strips need exactly
 * the same behaviour, so it lives here now and both call sites read from one
 * implementation rather than drifting apart.
 *
 * The hook owns interaction only. Column widths, gutters, arrows and fades stay
 * with each rail, because those are the parts that genuinely differ between a
 * three-up collection card and a five-up product card.
 */

export interface UseHorizontalRailOptions {
  /**
   * Selector for one card inside the track. The scroll step is that card's
   * measured width plus the track's real gutter, so every breakpoint steps by
   * exactly one card without hard-coding any of them.
   */
  cardSelector?: string;
  /** Step used before any card has rendered. */
  fallbackStep?: number;
  /** Re-measure when this changes — typically the item count. */
  itemCount?: number;
}

export interface HorizontalRail {
  /** Attach to the scrolling container. */
  trackRef: React.RefObject<HTMLDivElement | null>;
  /** True while the content is wider than the port — gates arrows and fades. */
  overflows: boolean;
  canPrev: boolean;
  canNext: boolean;
  /** Step one card left (-1) or right (1). */
  scroll: (dir: 1 | -1) => void;
  /** Spread onto the scrolling container. */
  handlers: {
    onPointerDown: (e: ReactPointerEvent) => void;
    onPointerMove: (e: ReactPointerEvent) => void;
    onPointerUp: (e: ReactPointerEvent) => void;
    onPointerCancel: (e: ReactPointerEvent) => void;
    onDragStart: (e: ReactMouseEvent) => void;
    onClickCapture: (e: ReactMouseEvent) => void;
    onKeyDown: (e: ReactKeyboardEvent) => void;
  };
}

export function useHorizontalRail({
  cardSelector = '[data-rail-card]',
  fallbackStep = 320,
  itemCount = 0,
}: UseHorizontalRailOptions = {}): HorizontalRail {
  const trackRef = useRef<HTMLDivElement>(null);
  /**
   * How far the pointer must travel before this counts as a DRAG rather than a
   * click. 4px was catching ordinary clicks — a mouse routinely moves five or
   * six pixels between press and release, and every one of those was being
   * treated as a drag and having its click cancelled. 10px is past normal click
   * jitter and still far short of a deliberate drag.
   */
  const DRAG_THRESHOLD = 10;

  const dragRef = useRef({
    down: false,
    startX: 0,
    startScroll: 0,
    moved: false,
    /** Whether the pointer is currently captured — see `onPointerMove`. */
    captured: false,
  });
  const [overflows, setOverflows] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Step by one card, measured off a real card so every breakpoint stays in sync
  // with the column widths the rail declares. Cards are large — a multi-card
  // step would jump most of the row past the viewer.
  const scroll = useCallback(
    (dir: 1 | -1) => {
      const el = trackRef.current;
      if (!el) return;
      const card = el.querySelector<HTMLElement>(cardSelector);
      // The gutter is breakpoint-dependent, so read it off the track rather than
      // hard-coding one of the values.
      const track = el.firstElementChild;
      const gap = track ? parseFloat(getComputedStyle(track).columnGap) || 24 : 24;
      const step = (card ? card.getBoundingClientRect().width : fallbackStep) + gap;
      el.scrollBy({ left: dir * step, behavior: 'smooth' });
    },
    [cardSelector, fallbackStep]
  );

  // ── Click-and-drag to scroll (mouse only — touch keeps native swipe) ──
  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const el = trackRef.current;
    if (!el) return;
    /**
     * Note what happened, and CAPTURE NOTHING YET.
     *
     * This used to call `setPointerCapture` here, on every press. Capturing
     * retargets the pointer stream to the track, and the click that follows is
     * dispatched at the nearest common ancestor of the pointerdown and
     * pointerup targets — which, once both are the track, is the track itself
     * and no longer the card. The link inside never received the click, so
     * homepage cards did not open and the wishlist and add-to-bag buttons
     * inside them did not fire. The shop grid was unaffected because it is a
     * plain grid and never mounts this hook.
     *
     * Capture is genuinely useful once a drag is under way — it keeps the row
     * moving when the pointer leaves the track — so it is acquired in
     * `onPointerMove` at the moment the drag threshold is crossed, and never
     * before, which leaves an ordinary click completely untouched.
     */
    dragRef.current = {
      down: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: false,
      captured: false,
    };
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    const d = dragRef.current;
    if (!d.down) return;
    const el = trackRef.current;
    if (!el) return;
    const dx = e.clientX - d.startX;

    // Below the threshold this is still a click in progress: do not scroll, do
    // not capture, and do not mark it as moved.
    if (!d.moved) {
      if (Math.abs(dx) <= DRAG_THRESHOLD) return;
      d.moved = true;
      // A real drag has begun — capture now, so the row keeps following the
      // pointer even when it leaves the track.
      el.setPointerCapture?.(e.pointerId);
      d.captured = true;
    }

    el.scrollLeft = d.startScroll - dx;
  };
  const endDrag = (e: ReactPointerEvent) => {
    // Release only what was actually captured. Releasing a pointer that was
    // never captured throws in some browsers.
    if (dragRef.current.captured) {
      trackRef.current?.releasePointerCapture?.(e.pointerId);
      dragRef.current.captured = false;
    }
    dragRef.current.down = false;
  };
  // Swallow the click that fires right after a drag so cards don't navigate.
  const onClickCapture = (e: ReactMouseEvent) => {
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current.moved = false;
    }
  };

  // ── Keyboard: ←/→ step the row once it's focused ──
  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); scroll(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); scroll(-1); }
  };

  // ── Edge state: drives the arrows, the fades, and whether either appears ──
  const syncEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setOverflows(max > 1);
    setCanPrev(el.scrollLeft > 1);
    setCanNext(el.scrollLeft < max - 1);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    syncEdges();

    // ── Mouse-wheel → horizontal scroll, both directions ──
    // Registered natively with { passive: false }: React routes onWheel through a
    // passive listener, so preventDefault() there is ignored and the page scrolls
    // along with the row.
    const onWheel = (e: WheelEvent) => {
      // Trackpad horizontal gestures already scroll the track natively — only a
      // vertical-dominant wheel needs redirecting sideways.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.deltaY === 0) return;
      const max = el.scrollWidth - el.clientWidth;
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= max - 1;
      // Only hijack the wheel while there's room to scroll in that direction, so
      // the page keeps scrolling normally at either edge (and always when the
      // row fits, where atStart and atEnd are both true).
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', syncEdges, { passive: true });

    // Column widths are percentage-based, so overflow changes with the viewport.
    const ro = new ResizeObserver(syncEdges);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('scroll', syncEdges);
      ro.disconnect();
    };
  }, [syncEdges, itemCount]);

  return {
    trackRef,
    overflows,
    canPrev,
    canNext,
    scroll,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      /* Cards are links wrapping images — both natively draggable, so without
         this the browser starts its own drag-and-drop as soon as you move,
         firing pointercancel and killing the drag-to-scroll gesture. */
      onDragStart: (e: ReactMouseEvent) => e.preventDefault(),
      onClickCapture,
      onKeyDown,
    },
  };
}
