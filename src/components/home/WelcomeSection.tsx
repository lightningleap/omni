"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ModeFade from '@/components/home/ModeFade';
import { useHomepageContent } from '@/store/useHomepageMode';

/**
 * The welcome / brand intro — the compact block that replaced the video hero.
 *
 * WHY IT LOOKS LIKE THIS
 * The page used to open on a 92–110vh video banner. It was handsome and it cost
 * a whole viewport: a shopper had to scroll past the entire screen before
 * meeting a single product. The film is still on the page — it moved into the
 * middle promotional window below, where it merchandises rather than blocks —
 * and what is left here is the part that was actually doing work: who makes this
 * and why, in about a fifth of the height.
 *
 * TWO COLUMNS, ONE IMAGE
 * The copy alone left the right half of the section empty, which read as
 * unfinished rather than spacious. It is now a two-column editorial composition:
 * the brand introduction on the left at ~53%, and a single studio photograph on
 * the right at ~42%, vertically centred against it.
 *
 * The photograph is doing a specific job, not filling a hole. The eyebrow above
 * it claims "Independent Studio · Drawn by Hand", and a picture of the actual
 * drawing is the cheapest possible proof of that claim — it also sets the
 * visitor up for the Meet UNRWLY link sitting directly beneath it. Anything
 * decorative here would be worse than the empty space it replaced.
 *
 * Two routes out, no more: into the catalogue, and into the founder's story for
 * the visitor who wants to know who is behind the shop before they buy from it.
 */

/**
 * Fallback only. The real photograph is `public/brand/studio.jpg` — the shop's
 * own studio flat-lay — which the page resolves from disk and passes in as
 * `studioImage`. This URL is what renders if that file is ever moved or renamed,
 * so the section degrades to a related image instead of an empty frame.
 *
 * Whatever ends up here has to clear two rules the section's argument depends
 * on: it must actually show hand-drawn work, which is what the eyebrow beside it
 * claims, and it must carry no other label's branding — a competitor's notebook
 * in frame is the last thing that belongs on a page arguing UNRWLY is its own
 * brand.
 */
const STUDIO_FALLBACK =
  'https://images.unsplash.com/photo-1557777586-f6682739fcf3?w=1200&q=80';

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: EASE, delay },
});

export default function WelcomeSection({ studioImage }: { studioImage?: string | null }) {
  const { mode, welcome } = useHomepageContent();

  return (
    <ModeFade mode={mode}>
      <section aria-label="Welcome to UNRWLY" className="pt-14 pb-10 md:pt-20 md:pb-14">
        <div className="mx-auto max-w-[1440px] px-4 md:px-12">
          {/* 53 / 42 with an 8% gutter on desktop. `minmax(0,…)` on both tracks
              so neither column can be forced wider than its share by its own
              content. Below `lg` it collapses to one column and the image falls
              under the buttons, which is the order the copy wants to be read in
              on a phone anyway. */}
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,53fr)_minmax(0,42fr)] lg:gap-[5%] xl:gap-20">
            <div>
            {welcome.badge && (
              <motion.p
                {...fadeUp(0.05)}
                className="type-label flex items-center gap-3 text-neutral-500"
              >
                <span aria-hidden className="h-px w-9 bg-accent" />
                {welcome.badge}
              </motion.p>
            )}

            {/* `.type-h2` rather than `.type-h1`: this is a page-level heading,
                not a campaign banner, and the smaller step is most of what makes
                the section compact.

                `title` is optional. Where a mode omits it, the supporting line
                stands as the heading unchanged — same element, same `.type-h3`,
                same case and colour — and drops only its top margin, which
                existed to separate it from the wordmark above. Without that the
                badge would sit 8px further from the heading than it was
                designed to. */}
            <motion.h1 {...fadeUp(0.12)} className="type-h2 mt-5 uppercase" style={{ color: 'var(--color-ink)' }}>
              {welcome.title}
              <span
                className={`type-h3 block normal-case text-neutral-600${welcome.title ? ' mt-2' : ''}`}
              >
                {welcome.titleSupporting}
              </span>
            </motion.h1>

            {/* Capped at 640px rather than by character count: the column is now
                roughly half the page, and a measure set in `ch` would keep
                widening on a large display until the paragraph outran the image
                beside it.

                `whitespace-pre-line` so a tagline authored as separate lines
                keeps its breaks. It is the only way three statements with no
                joining punctuation read correctly — run together they collide
                ("…no AI Printed to order…"). Wrapping is untouched: a line
                longer than the measure still wraps normally, which is what
                keeps this from overflowing on a phone. */}
            {welcome.tagline && (
              <motion.p {...fadeUp(0.2)} className="type-body mt-6 max-w-[640px] whitespace-pre-line text-neutral-500">
                {welcome.tagline}
              </motion.p>
            )}

            <motion.div {...fadeUp(0.28)} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href={welcome.cta.href}
                className="type-button group inline-flex h-[54px] items-center justify-center gap-2 rounded-full bg-accent px-8 text-[13px] uppercase tracking-[0.12em] text-accent-on shadow-[0_10px_24px_-12px_rgb(var(--accent-ring-rgb)/0.6)] transition-[transform,background-color,box-shadow] duration-[250ms] ease-out hover:-translate-y-0.5 hover:bg-accent-950 hover:text-accent-on-strong hover:shadow-[0_16px_30px_-12px_rgb(var(--accent-ring-rgb)/0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                {welcome.cta.label}
                <ArrowRight size={16} strokeWidth={2} className="transition-transform duration-[250ms] ease-out group-hover:translate-x-1 motion-reduce:transition-none" />
              </Link>

              {welcome.secondaryCta && (
                <Link
                  href={welcome.secondaryCta.href}
                  className="type-button group/meet inline-flex h-[54px] items-center justify-center gap-2 rounded-full border border-neutral-300 px-8 text-[13px] uppercase tracking-[0.12em] text-ink transition-[background-color,border-color] duration-[250ms] ease-out hover:border-neutral-400 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2"
                >
                  {welcome.secondaryCta.label}
                  <ArrowRight size={16} strokeWidth={2} className="transition-transform duration-[250ms] ease-out group-hover/meet:translate-x-1 motion-reduce:transition-none" />
                </Link>
              )}
            </motion.div>
            </div>

            {/* RIGHT — the studio.
                4:3 rather than the 4:5 portrait this started as: the studio
                photograph is a landscape flat-lay (1536 × 1024), and forcing it
                into a tall frame would crop away exactly the things that make it
                worth showing — the sketchbook, the swatches, the desk around
                them. At 4:3 against a 500px cap it lands ~375px tall, which
                reads as a deliberate editorial plate rather than a squeezed one,
                and takes only ~85px off each side of the source: the sketchbook
                (centre-left), the fabric swatches and the laptop all survive
                intact, and what goes is the outermost edge of the reference
                books and the pen.

                Sized by aspect ratio rather than fixed pixels, so it holds its
                shape from a phone up to a wide display and reserves its space
                before the file loads (no shift). `object-center` keeps the
                middle of the composition — where the sketchbook sits — rather
                than drifting to an edge. `lg:ml-auto` holds it against the
                section's right edge, on the same grid as everything else on the
                page, instead of floating in the middle of its column.

                No overlay, no gradient, no floating card, and the one shadow is
                the section's existing hairline: the photograph is the point, and
                dressing it up would make it read as a banner. */}
            <motion.div
              {...fadeUp(0.2)}
              className="relative aspect-[4/3] w-full max-w-[500px] overflow-hidden rounded-card bg-[#F1F1EF] shadow-[0_2px_10px_-6px_rgba(20,20,25,0.18)] lg:ml-auto"
            >
              <Image
                src={studioImage ?? STUDIO_FALLBACK}
                alt="The UNRWLY studio desk — a sketchbook of hand-drawn designs, fabric swatches and reference material"
                fill
                sizes="(max-width:1024px) 100vw, 500px"
                className="object-cover object-center"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </ModeFade>
  );
}
