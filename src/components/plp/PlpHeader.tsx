"use client";

import CategoryHeroTitle from '@/components/CategoryHeroTitle';

/**
 * Page header — category name, optional supporting line, live result count.
 *
 * ── WHAT WAS ACTUALLY WRONG ─────────────────────────────────────────────────
 * Not the container, and not the type. `PlpClient` has always wrapped this and
 * the grid in the same `max-w-[1440px]` with the same `px-4 md:px-12`, so the
 * two already shared their boundaries exactly; and the title renders at
 * `--type-h2-size`, which this project overrides to 24→34px — modest, not the
 * oversized headline it reads as.
 *
 * The fault was that all three pieces were stacked in ONE COLUMN, with the
 * description capped at 520px. On a 1344px content width that put every mark on
 * the page inside the left 40% and left the right 800px with nothing in it and
 * nothing terminating it. A minimal page and an unfinished one differ by
 * whether the empty part is bounded, and this one's was not.
 *
 * ── WHAT MAKES THE WIDTH READ AS DELIBERATE ─────────────────────────────────
 * Two things, and neither is a decoration or a new asset:
 *
 * 1. The count moves to the FAR RIGHT, on the title's baseline. It is real
 *    content that already existed, and putting it at the other end of the
 *    container turns the gap between into a measured span rather than a
 *    trailing-off. This is the standard editorial category masthead.
 *
 * 2. A hairline under the whole block. It draws the container's true width, so
 *    the eye can see where the page ends instead of guessing from where the
 *    text stops — and it ties the title and the count into one composition.
 *    The same 6%-black rule the product page's accordions use.
 *
 * No image is introduced: `ShopCategory` carries no artwork, and inventing some
 * to fill the right side would be inventing content.
 *
 * ── RESPONSIVE ──────────────────────────────────────────────────────────────
 * The two-up composition is `lg` and above only. Below that it is one column in
 * the reading order the brief asks for — title, description, count — because a
 * masthead split across a phone's width is just two cramped columns.
 */
export default function PlpHeader({
  title,
  qualifier,
  description,
  count,
}: {
  title: string;
  /** Optional leading segment, e.g. "Kids" in "Kids · Toddler". */
  qualifier?: string;
  description?: string;
  count: number;
}) {
  return (
    <header className="mb-8 border-b border-black/[0.06] pb-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        {/* Title + description. Capped so the supporting line keeps a reading
            measure even on a very wide display, but the BLOCK is no longer what
            decides how much of the page gets used. */}
        <div className="min-w-0">
          <CategoryHeroTitle title={qualifier ? `${qualifier} · ${title}` : title} />

          {description && (
            <p className="type-body mt-2.5 max-w-[52ch] text-neutral-500">{description}</p>
          )}
        </div>

        {/* The count, at the far end of the container.
            Quieter than it was: the shadow and the backdrop blur are gone —
            it sits on a flat ground and never needed to float off it — and the
            figure steps 15px → 13px so it reads as supporting information
            beside the title rather than as a second heading. `shrink-0` keeps
            it on one line when a long category name crowds it. */}
        <div className="shrink-0 lg:pb-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent-950/10 bg-white/70 px-3.5 py-1.5">
            <span className="text-[13px] font-semibold tracking-tight text-accent-950">
              {count}
            </span>
            <span className="type-caption text-[11px] uppercase tracking-[0.18em] text-neutral-400">
              {count === 1 ? 'Product' : 'Products'}
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}
