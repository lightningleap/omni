"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useHorizontalRail } from '@/hooks/useHorizontalRail';
import type { CollectionCardItem } from '@/data/homepage';

// Same floating glass control used by the other horizontal rails.
const ARROW =
  "hidden md:flex absolute top-1/2 -translate-y-1/2 z-30 h-11 w-11 items-center justify-center rounded-full bg-white/75 backdrop-blur-[16px] border border-white/70 text-accent-ink shadow-[0_10px_30px_rgb(var(--accent-shade-rgb)/0.08)] transition-[background-color,color,transform,box-shadow,opacity] duration-200 ease-out hover:bg-accent hover:text-accent-on hover:scale-105 hover:shadow-[0_14px_34px_rgb(var(--accent-shade-rgb)/0.18)] active:scale-95 disabled:pointer-events-none disabled:opacity-30 disabled:shadow-none";

// Soft, confident settle — matches the hero's easing so motion feels native.
const EASE = 'cubic-bezier(0.22,1,0.36,1)';
const SIZES = '(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw';
// Subtle bottom→top gradient — aids readability without hiding the product.
const GRADIENT = 'linear-gradient(to top, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.36) 30%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0) 64%)';
const TEXT_SHADOW = '0 1px 10px rgba(0,0,0,0.35)';

// Edge fades wash out to the warm off-white the whole site sits on, so the row
// reads as continuing past the container rather than being cut off.
const FADE_LEFT = 'linear-gradient(to right, var(--color-bg) 0%, rgba(248,246,242,0) 100%)';
const FADE_RIGHT = 'linear-gradient(to left, var(--color-bg) 0%, rgba(248,246,242,0) 100%)';

// Vertical breathing room *inside* the scroll port, cancelled by an equal
// negative margin. A scroll container clips at its padding edge, so without this
// the card's hover lift (-6px) and the tail of its hover shadow (~23px below)
// would be sliced off. Net layout effect: zero — the cards sit exactly where the
// grid used to put them.
const CLIP_HEADROOM = 'py-6 -my-6';

/**
 * The reel the old full-viewport hero fell back to when the admin had configured
 * nothing. Carried over verbatim so removing the hero didn't quietly take the
 * shop's video off the site: with no clips in StoreConfig the window plays these
 * exactly as the banner used to. If they are unreachable the card simply shows
 * its poster, which is the same thing it does while any video is still loading.
 */
const FALLBACK_CLIPS = [
  'https://res.cloudinary.com/dydv8v9p6/video/upload/v1712614561/hero-1_qjhsqv.mp4',
  'https://res.cloudinary.com/dydv8v9p6/video/upload/v1712614561/hero-2_pjysqv.mp4',
  'https://res.cloudinary.com/dydv8v9p6/video/upload/v1712614561/hero-3_ojysqv.mp4',
  'https://res.cloudinary.com/dydv8v9p6/video/upload/v1712614561/hero-4_njysqv.mp4',
];

/**
 * The film that fills the video window.
 *
 * Deliberately not a full-viewport banner treatment: the old hero shipped four
 * readability scrims and a sliding transition sized for a 110vh stage, both of
 * which would fight the card's own gradient and look frantic inside a square.
 * This is the same idea reduced to what a card needs: one clip at a time,
 * advancing on `ended`.
 *
 * `autoPlay muted playsInline` is the combination every browser allows to start
 * without a gesture. `loop` only when there is a single clip — with several,
 * `onEnded` is what moves the reel along, and `loop` would prevent it firing.
 */
function VideoSlot({ clips, poster }: { clips: string[]; poster: string }) {
  const [index, setIndex] = useState(0);
  const single = clips.length === 1;

  return (
    <video
      // Keyed by source so a new clip mounts a fresh element and actually
      // starts; swapping `src` on a playing <video> leaves the old frame up.
      key={clips[index]}
      src={clips[index]}
      poster={poster}
      autoPlay
      muted
      loop={single}
      playsInline
      preload="metadata"
      aria-hidden
      tabIndex={-1}
      onEnded={single ? undefined : () => setIndex((i) => (i + 1) % clips.length)}
      className="h-full w-full object-cover"
    />
  );
}

/**
 * One promotional collection card — Sale, Bestsellers, Teacher Gifts, whichever
 * edits the shop is running (see `data/homepage/collections.ts`).
 *
 * Design, dimensions, typography, radius and hover choreography are the ones
 * this card has always had; only the content and its purpose changed — these now
 * point at collections rather than broad Men / Women / Unisex categories. The
 * shadow is a touch softer and the border a warm neutral rather than a cool one,
 * so the card settles onto the site's off-white ground instead of sitting on it.
 *
 * `productImage` is optional: a card that has one swaps to the artwork isolated
 * on white at hover, exactly as before; a card without one keeps the same lift
 * and zoom and simply doesn't swap.
 */
function CollectionCard({
  item,
  priority,
  videoUrls,
}: {
  item: CollectionCardItem;
  priority: boolean;
  /** Clips for the video slot. Empty/absent → the card renders as a still. */
  videoUrls?: string[];
}) {
  const { title, description, meta, image, productImage, href, ariaLabel, ctaLabel } = item;

  // The video slot is a card first and a video second: it only ever swaps what
  // fills the same square, so the three windows keep identical dimensions,
  // gradient, copy block and button — no card in the row outweighs the others.
  const configured = (videoUrls ?? []).filter((u) => u.trim() !== '');
  const clips = item.videoSlot ? (configured.length ? configured : FALLBACK_CLIPS) : [];
  const isVideo = clips.length > 0;

  return (
    <Link
      href={href}
      aria-label={meta ? `${ariaLabel} — ${meta}` : ariaLabel}
      style={{ transitionTimingFunction: EASE }}
      className="group relative block overflow-hidden rounded-card border border-[#EAE6DF] bg-white shadow-[0_1px_2px_rgba(20,20,25,0.03)] transition-[transform,box-shadow] duration-[250ms] hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-20px_rgba(20,20,25,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[#F1F1EF]">
        {/* Shared transform wrapper — both layers scale together to 1.03 */}
        <div
          style={{ transitionTimingFunction: EASE }}
          className="absolute inset-0 origin-center transition-transform duration-[250ms] will-change-transform group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        >
          {isVideo ? (
            /* The film, inside the card. Muted + playsInline so it can autoplay
               on every browser including iOS, looping when there is a single
               clip and advancing through the reel when there are several. The
               still image is the poster, so the card looks finished before a
               single frame has downloaded and stays looking finished if the
               visitor's connection or data-saver blocks the video outright. */
            <VideoSlot clips={clips} poster={image} />
          ) : (
            /* Default — full-bleed studio shot */
            <Image
              src={image}
              alt={`${title} — Unrwly collection`}
              fill
              priority={priority}
              sizes={SIZES}
              draggable={false}
              style={{ transitionTimingFunction: EASE }}
              className={`object-cover object-top transition-opacity duration-[250ms] motion-reduce:transition-none ${productImage ? 'group-hover:opacity-0' : ''}`}
            />
          )}
          {/* Hover — the artwork isolated on white, premium product showcase */}
          {!isVideo && productImage && (
            <div
              className="absolute inset-0 bg-white p-6 opacity-0 transition-opacity duration-[250ms] group-hover:opacity-100 motion-reduce:transition-none"
              style={{ transitionTimingFunction: EASE }}
            >
              <div className="relative h-full w-full">
                <Image
                  src={productImage}
                  alt=""
                  aria-hidden
                  fill
                  sizes={SIZES}
                  draggable={false}
                  className="object-contain drop-shadow-[0_20px_32px_rgba(20,20,25,0.18)]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Gradient overlay — dark at the bottom, transparent toward the top */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: GRADIENT }} />

        {/* Content — inside the gradient, bottom-left, generous breathing room.
            Title colour is set inline to beat the global unlayered h1–h6 rule. */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col p-6 md:p-7">
          <h3 style={{ color: '#FFFFFF', textShadow: TEXT_SHADOW }} className="type-h3">
            {title}
          </h3>
          <p style={{ textShadow: TEXT_SHADOW }} className="mt-3 max-w-[26ch] text-[15px] font-normal leading-snug text-[#E5E5E5]">
            {description}
          </p>
          {meta && (
            <p style={{ textShadow: TEXT_SHADOW }} className="type-caption mt-3 text-[#CFCFCF]">{meta}</p>
          )}

          {/* Premium CTA — compact, left-aligned. White by default, warms to the
              brand accent on hover. The whole card is the link. */}
          <span
            style={{ transitionTimingFunction: EASE }}
            className="type-button mt-5 inline-flex h-10 w-fit items-center gap-2 rounded-card bg-white px-4 text-[13px] text-ink shadow-[0_6px_16px_-8px_rgba(0,0,0,0.45)] transition-colors duration-[250ms] group-hover:bg-accent group-hover:text-accent-on"
          >
            {ctaLabel ?? 'Explore'}
            <ArrowRight
              size={15}
              strokeWidth={2}
              style={{ transitionTimingFunction: EASE }}
              className="transition-transform duration-[250ms] group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Single-row collection rail — the cards never wrap, they scroll.
 *
 * The row is a one-row `grid-flow-col`, so promoting a fourth or fifth
 * collection extends the row sideways instead of starting a second line. Column
 * widths reproduce the original wrapping grid EXACTLY at every breakpoint —
 * 100% / calc(50% − 10px) / calc(50% − 12px) / calc(33.333% − 16px), against the
 * same gap-5 / md:gap-6 gutters — so the three-card desktop row is
 * pixel-for-pixel what it was. Cards are never squeezed to fit: overflow becomes
 * scroll.
 *
 * Scrolls every way the site's other rails do — native touch swipe, trackpad,
 * mouse wheel (a vertical-dominant wheel is redirected sideways), click-and-drag,
 * ←/→ once focused, and the floating glass arrows. All of that now lives in
 * `useHorizontalRail`, which the product category strips share: the behaviour is
 * unchanged, it simply has one implementation instead of two. The scrollbar is
 * hidden via `.no-scrollbar` without disabling any of it.
 *
 * The arrows and the edge fades only exist while the row actually overflows, so
 * the standard three-card row on a desktop renders with nothing added to it.
 */
export default function CollectionCardRail({
  items,
  videoUrls,
}: {
  items: CollectionCardItem[];
  /**
   * Clips for the card marked `videoSlot`. Admin-configured, so they arrive
   * from the server rather than from the authored card data.
   */
  videoUrls?: string[];
}) {
  const { trackRef, overflows, canPrev, canNext, scroll, handlers } = useHorizontalRail({
    itemCount: items.length,
  });

  if (!items.length) return null;

  return (
    /* `flow-root` establishes a block formatting context so the track's negative
       vertical margins (see CLIP_HEADROOM) can't collapse through this wrapper
       and drag the whole row upward. It also keeps this box exactly as tall as
       the cards, which is what the arrows centre on and the fades span. */
    <div className="relative flow-root">
      {overflows && (
        <>
          <button
            aria-label="Scroll to previous collections"
            onClick={() => scroll(-1)}
            disabled={!canPrev}
            className={`${ARROW} left-0`}
          >
            <ChevronLeft size={20} strokeWidth={2.25} />
          </button>
          <button
            aria-label="Scroll to next collections"
            onClick={() => scroll(1)}
            disabled={!canNext}
            className={`${ARROW} right-0`}
          >
            <ChevronRight size={20} strokeWidth={2.25} />
          </button>

          {/* Edge fades — the only hint on touch, where the arrows are hidden.
              Each one is tied to the direction it points at, so neither shows
              against an edge you've already reached. */}
          <span
            aria-hidden
            style={{ backgroundImage: FADE_LEFT }}
            className={`pointer-events-none absolute inset-y-0 left-0 z-20 w-10 transition-opacity duration-200 ease-out md:w-14 ${canPrev ? 'opacity-100' : 'opacity-0'}`}
          />
          <span
            aria-hidden
            style={{ backgroundImage: FADE_RIGHT }}
            className={`pointer-events-none absolute inset-y-0 right-0 z-20 w-10 transition-opacity duration-200 ease-out md:w-14 ${canNext ? 'opacity-100' : 'opacity-0'}`}
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
        aria-label="Featured collections"
        className={`no-scrollbar snap-x snap-proximity cursor-grab select-none overflow-x-auto overscroll-x-contain ${CLIP_HEADROOM} [-webkit-overflow-scrolling:touch] focus-visible:outline-none active:cursor-grabbing`}
      >
        {/* One row, never two. Column widths and gutters are the wrapping grid's,
            carried over verbatim — see the component doc. */}
        <div className="grid auto-cols-[100%] grid-flow-col grid-rows-1 gap-5 sm:auto-cols-[calc(50%_-_10px)] md:auto-cols-[calc(50%_-_12px)] md:gap-6 lg:auto-cols-[calc(33.333%_-_16px)]">
          {items.map((item, i) => (
            <div key={item.id} data-rail-card className="snap-start">
              <CollectionCard item={item} priority={i === 0} videoUrls={videoUrls} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
