"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import BrandMark from '@/components/BrandMark';
import SocialLinks from '@/components/SocialLinks';
import { useBrandPresence, useHomepageContent, useHomepageMode } from '@/store/useHomepageMode';

/**
 * Meet UNRWLY — recomposed as an editorial brand story.
 *
 * WHY THIS PAGE EXISTS
 * Everything else on the site sells a product. This is the page that answers
 * "who am I actually buying from?", which for a one-person illustrated label is
 * the question that decides the sale. It is written the way the shop's own Etsy
 * About reads — first person, direct, a bit dry — because the plainness is the
 * credential.
 *
 * ── THE COMPOSITION ─────────────────────────────────────────────────────────
 * The previous version was a vertical run of near-identical chapters: heading
 * left, prose right, repeat. Uniform structure reads as a document however good
 * the writing is, because nothing is louder than anything else and the eye has
 * nowhere to land.
 *
 * Every section here has a different shape, and the sequence alternates what it
 * asks of the reader — read, look, pause, read, look:
 *
 *   hero (85vh, image bleeding right)  →  statement + narrow intro
 *   →  full-bleed studio photograph    →  4/7 asymmetric story
 *   →  full-bleed accent statement     →  two editorial columns
 *   →  45/55 principles + large image  →  split image/copy + figures
 *   →  brand extension, two images     →  closing image, manifesto, CTAs
 *
 * ── THE COPY IS UNCHANGED ───────────────────────────────────────────────────
 * Not one sentence has been rewritten. Where the layout calls for a large
 * statement, the sentence is LIFTED VERBATIM from the prose it sits beside —
 * so the page contains nothing the founder did not already say. That is also
 * why there is no "it's a point of view" or "be a little unrwly" here: those
 * are not in this brand's copy, and inventing a slogan for the page whose whole
 * job is to be believed would undo the page.
 *
 * ── THE FIGURES ARE COUNTED, NOT CLAIMED ────────────────────────────────────
 * 87 and 52 are the live Etsy listings, counted in `page.tsx` from the data the
 * Printify sync generates. They are labelled "designs" because that is what
 * they are. There is no founding year, customer total, order count or city
 * tally on this page, because this project holds no such data.
 */

// 1280, down from the storefront grid's 1440: a page of prose wants a shorter
// measure than a page of product tiles.
const SHELL = 'mx-auto w-full max-w-[1280px] px-5 md:px-10 lg:px-12';

/**
 * Scroll reveal — a fade and a small rise, nothing else.
 *
 * Honours `prefers-reduced-motion` by collapsing to a plain fade with no
 * transform, so a reader who has asked the OS for less movement gets none.
 */
function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28 }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.75, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * An image that settles from 1.03 to 1 as it enters the viewport.
 *
 * The scale lives on the <Image> inside a fixed, overflow-hidden frame, so the
 * frame never changes size and nothing below it moves — the settle is felt
 * rather than seen. Disabled entirely under reduced motion.
 */
function SettlingImage({
  src,
  alt,
  className = '',
  sizes,
  priority = false,
  fit = 'cover',
}: {
  src: string;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
  /**
   * `cover` crops a photograph to its frame. `contain` mats a LOGO inside it —
   * the brand lockups are ~3:1 and were being pushed through `object-cover`
   * into portrait frames, which threw away most of their width and put "nrwl"
   * on screen instead of the wordmark. A logo has no region that can be
   * discarded, so it is contained and the frame is padded.
   */
  fit?: 'cover' | 'contain';
}) {
  const reduce = useReducedMotion();
  const contain = fit === 'contain';
  return (
    <div className={`relative overflow-hidden bg-[#F5F5F2] ${className}`}>
      <motion.div
        className={contain ? 'absolute inset-6 md:inset-10' : 'absolute inset-0'}
        initial={reduce ? undefined : { scale: 1.03 }}
        whileInView={reduce ? undefined : { scale: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={contain ? 'object-contain' : 'object-cover'} />
      </motion.div>
    </div>
  );
}

/**
 * An image slot that survives the image being absent.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 * Every image on this page is resolved by filename at request time (see
 * `findStudioImage`), so any of them can legitimately be null while the studio
 * is still shooting. The page used to answer that by dropping the whole block —
 * `{studioImage && <section>…</section>}` — which meant a missing file removed
 * a section, re-flowed the column widths around it, and quietly changed the
 * composition rather than showing a gap.
 *
 * This keeps the slot. Same aspect ratio, same position in the grid, same
 * rhythm down the page, whether or not there is a photograph in it. What lands
 * when the file appears is exactly what the layout was designed around.
 *
 * The empty state is the plate `SettlingImage` already sits on — #F5F5F2 with a
 * hairline — carrying the brand mark, which is the same fallback the hero
 * already used. No new visual language, no dashed 'upload here' box: this is a
 * customer-facing page, and the empty frame should read as a quiet plate, not
 * as a missing asset.
 */
function Frame({
  src,
  alt,
  className = '',
  sizes,
  priority = false,
  fit = 'cover',
}: {
  /** The resolved path, or null while no file has been saved. */
  src: string | null;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
  fit?: 'cover' | 'contain';
}) {
  if (src) {
    return (
      <SettlingImage src={src} alt={alt} className={className} sizes={sizes} priority={priority} fit={fit} />
    );
  }

  return (
    <div
      role='img'
      aria-label={alt || 'Image coming soon'}
      className={`flex items-center justify-center border border-[#EAE6DF] bg-[#F5F5F2] ${className}`}
    >
      <BrandMark size='md' />
    </div>
  );
}

/** The four principles. Each is a claim the prose above already makes. */
const PRINCIPLES = [
  {
    n: '01',
    title: 'Original',
    body: 'Every design in this shop is original and drawn by hand — mine. Nothing licensed in, no trend templates, no AI.',
  },
  {
    n: '02',
    title: 'Personality',
    body: 'Bold, a bit sharp, occasionally rude, and unbothered about it.',
  },
  {
    n: '03',
    title: 'Made to order',
    body: 'Nothing here is made until you order it. No warehouse of guesses, no end-of-season pile.',
  },
  {
    n: '04',
    title: 'Unisex by default',
    body: 'Every kids design is unisex. Not a marketing position — it is just obviously correct.',
  },
] as const;

export default function MeetUnrwlyClient({
  founderImage,
  studioImage,
  adultBanner,
  kidsBanner,
  designCounts,
}: {
  founderImage: string | null;
  studioImage: string | null;
  adultBanner: string | null;
  kidsBanner: string | null;
  designCounts: { adult: number; kids: number; total: number };
}) {
  const { mode } = useHomepageMode();
  const { label } = useHomepageContent();
  const { shopName, etsyUrl } = useBrandPresence();

  const [activePrinciple, setActivePrinciple] = useState(0);

  const shopHref = mode === 'kids' ? '/collections/all?audience=kids' : '/collections/all';

  /**
   * The hero's image, in order of preference.
   *
   * There is no founder photograph in the project, so the hero cannot be a
   * portrait. It uses the storefront's own banner — the strongest piece of real
   * photography available — and falls back to the brand mark on a plain plate
   * rather than to a stock photograph of a stranger. On the one page whose job
   * is "a real person makes this", borrowing someone else's face would be the
   * most self-defeating thing possible.
   */
  // A portrait if one is ever saved, otherwise the studio photograph. The
  // lockup used to be first choice here, cropped into a 4:5 frame, so the page
  // opened on a fragment of its own logo. The brand plate now has the full-
  // width band directly below, where it fits.
  const heroImage = founderImage ?? studioImage ?? (mode === 'kids' ? kidsBanner : adultBanner);
  const lockup = mode === 'kids' ? kidsBanner : adultBanner;

  return (
    <main className="about-type overflow-x-clip pb-8">
      {/* ══ 1 · HERO ══════════════════════════════════════════════════════════
          Asymmetric and tall. The type column is given the width because the
          first thing this page must establish is a voice; the image bleeds off
          the right edge so the composition reads as a spread rather than a
          box beside some text. */}
      <section className={`${SHELL} grid items-center gap-10 py-10 md:grid-cols-12 md:gap-8 md:py-16`}>
        <div className="md:col-span-6 lg:col-span-5">
          <Reveal>
            <p className="type-label flex items-center gap-3 text-neutral-500">
              <span aria-hidden className="h-px w-9 bg-accent" />
              The person behind it
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <h1
              style={{ color: 'var(--color-ink)' }}
              className="type-h1 mt-6 uppercase leading-[1.02] tracking-[-0.02em]"
            >
              Meet
              <br />
              UNRWLY
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="type-h3 mt-8 max-w-[15ch] text-neutral-600">
              Not just another apparel shop.
            </p>
          </Reveal>
        </div>

        {/* Bleeds to the viewport edge from `md` up. `overflow-x-clip` on <main>
            is what makes that safe — the image can extend past the container
            without ever creating a horizontal scrollbar. */}
        <div className="md:col-span-6 md:col-start-7 md:-mr-12 lg:col-span-7 lg:col-start-6">
          <Reveal delay={0.1}>
            {/* `Frame` keeps the slot whether or not a photograph exists — see
                its note. The fallback plate it renders is the same one this
                block used to spell out inline. */}
            <Frame
              src={heroImage}
              alt="UNRWLY"
              priority
              sizes="(max-width: 768px) 100vw, 58vw"
              className="aspect-[4/5] w-full sm:aspect-[3/2] md:aspect-[5/4] lg:aspect-[4/3]"
            />
            {/* The small brand detail sitting with the image. */}
            <div className="mt-4 flex items-center justify-between gap-4 md:pr-12">
              <BrandMark size="sm" />
              <p className="type-caption text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                Drawn by hand · Printed to order
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ 2 · STATEMENT + INTRO ═════════════════════════════════════════════
          A large sentence, then the supporting paragraph in a narrow column
          offset beneath it. The statement is lifted verbatim from "Why UNRWLY
          Exists" further down — a reprise, not a new claim. */}
      {/* Statement in the left five columns, the paragraph and its two
          actions in the right six, both starting on the same line. It used to
          put the statement top-left and drop the paragraph a full row later,
          bottom-right, which left a void the size of the section in between. */}
      <section className={`${SHELL} py-14 md:py-20`}>
        <div className="grid gap-8 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
        <Reveal>
          <p
            style={{ color: 'var(--color-ink)' }}
            className="type-h2 max-w-[18ch] leading-[1.12]"
          >
            UNRWLY started as the shop I wanted to buy from.
          </p>
        </Reveal>
        </div>

          <div className="md:col-span-6 md:col-start-7">
            <Reveal delay={0.05}>
              <p className="type-body max-w-[54ch] text-neutral-500">
                Hi — UNRWLY is me. One person, a sketchbook, and a stubborn habit of
                turning the things that irritate and delight me into something you
                can wear. I have spent my working life in human rights and policy,
                which is exactly as heavy as it sounds, and I have been drawing the
                whole time. This shop is where the two finally met.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  href={shopHref}
                  className="type-button group inline-flex h-[54px] items-center justify-center gap-2 rounded-full bg-accent px-8 text-[13px] uppercase tracking-[0.12em] text-accent-on transition-[transform,background-color] duration-[250ms] ease-out hover:-translate-y-0.5 hover:bg-accent-950 hover:text-accent-on-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  Shop the {label} Collection
                  <ArrowRight size={16} strokeWidth={2} className="transition-transform duration-[250ms] ease-out group-hover:translate-x-1 motion-reduce:transition-none" />
                </Link>
                <a
                  href={etsyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="type-button group/etsy inline-flex h-[54px] items-center justify-center gap-2 rounded-full border border-neutral-300 px-8 text-[13px] uppercase tracking-[0.12em] text-ink transition-[background-color,border-color] duration-[250ms] ease-out hover:border-neutral-400 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2"
                >
                  Visit the Etsy Shop
                  <ArrowUpRight size={16} strokeWidth={2} className="transition-transform duration-[250ms] ease-out group-hover/etsy:translate-x-0.5 group-hover/etsy:-translate-y-0.5 motion-reduce:transition-none" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ 3 · FULL-BLEED STUDIO ═════════════════════════════════════════════
          The one moment that is only an image. Aspect-driven rather than `vh`,
          so it crops predictably instead of collapsing on a short laptop. */}
      <section aria-label="The UNRWLY studio">
        <Reveal>
          {/* The brand lockup on a full-width plate — contained, so every
              letter of it is on screen. It used to be the studio photograph,
              which the hero now carries; the same picture twice within one
              scroll made the second look like a mistake. */}
          <Frame
            src={lockup}
            alt="UNRWLY"
            sizes="100vw"
            fit="contain"
            className="aspect-[2/1] w-full sm:aspect-[3/1]"
          />
          <div className={`${SHELL} mt-4`}>
            <p className="type-caption text-[11px] uppercase tracking-[0.22em] text-neutral-400">
              From the studio
            </p>
          </div>
        </Reveal>
      </section>

      {/* ══ 4 · WHY UNRWLY EXISTS ═════════════════════════════════════════════
          4 columns of heading against 6 of prose, with 2 left empty on the
          right — the whitespace is part of the composition, not a gap. */}
      <section className={`${SHELL} py-14 md:py-20`}>
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <Reveal>
              <p className="type-label mb-6 text-neutral-500">The reason</p>
              <h2
                style={{ color: 'var(--color-ink)' }}
                className="type-h2 leading-[1.08] tracking-[-0.02em]"
              >
                Why
                <br />
                UNRWLY
                <br />
                Exists
              </h2>
            </Reveal>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            <Reveal delay={0.05}>
              <p className="type-body max-w-[58ch] text-neutral-500">
                I kept seeing the same shirts. Same six jokes, same tidy fonts, same
                inoffensive nothing, printed a million times over. Meanwhile the
                things I actually wanted to say — the small daily absurdities, the
                opinions that make a room go quiet, the affection I have for animals
                that have no business being that strange — were nowhere.
              </p>
            </Reveal>

            {/* The oversized interjection the brief asks for, in the brand's own
                words rather than a written-for-the-layout slogan. */}
            <Reveal delay={0.05}>
              <p
                style={{ color: 'var(--color-ink)' }}
                className="type-h3 my-12 max-w-[20ch] leading-[1.1] md:my-16"
              >
                Designs with a point of view, drawn properly.
              </p>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="type-body max-w-[58ch] space-y-5 text-neutral-500">
                <p>
                  So UNRWLY started as the shop I wanted to buy from. Designs with a
                  point of view, drawn properly, printed on garments that hold up to
                  being worn constantly rather than photographed once.
                </p>
                <p>
                  The name is the whole brief, really. Slightly unruly. A little too
                  much. Better that way.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ 5 · ACCENT STATEMENT ══════════════════════════════════════════════
          The page's one colour interruption, on the same `accent-800` ground the
          navbar and newsletter band already use — so Adult and Kids each get
          their own. Verbatim from the paragraph directly above it. */}
      <section className="bg-accent-800 py-14 md:py-20">
        <div className={SHELL}>
          <Reveal>
            <p className="type-h2 max-w-[30ch] leading-[1.15] text-accent-on-strong">
              Slightly unruly. A little too much. Better that way.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ 6 · TWO EDITORIAL COLUMNS ═════════════════════════════════════════
          The two story chapters side by side with a hairline between them —
          editorial columns, not cards. No border box, no shadow, no radius. */}
      <section className={`${SHELL} py-14 md:py-20`}>
        <div className="grid gap-12 md:grid-cols-2 md:gap-0">
          <Reveal className="md:pr-14">
            <p className="type-label mb-5 text-neutral-500">The work</p>
            <h2 style={{ color: 'var(--color-ink)' }} className="type-h3 mb-7 max-w-[14ch]">
              Designed by a Human
            </h2>
            <div className="type-body max-w-[52ch] space-y-5 text-neutral-500">
              <p>
                Every design in this shop is original and drawn by hand — mine.
                Concepts start as scribbles in a notebook, get argued with for a
                while, and only some of them survive to become artwork. Nothing is
                licensed in, nothing is a trend template with the colours swapped, and
                no artwork here is AI-generated.
              </p>
              <p>
                That is slower, and it is the point. A drawing made by a person
                carries decisions in it — why that line is wobbly, why that joke lands
                on the third word — and those are exactly the things that make you
                want to wear it twice.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.06} className="md:border-l md:border-[#EAE6DF] md:pl-14">
            <p className="type-label mb-5 text-neutral-500">The voice</p>
            <h2 style={{ color: 'var(--color-ink)' }} className="type-h3 mb-7 max-w-[14ch]">
              Designed With Personality
            </h2>
            <div className="type-body max-w-[52ch] space-y-5 text-neutral-500">
              <p>
                UNRWLY is bold, a bit sharp, occasionally rude, and unbothered about
                it. There is French with attitude, botanical illustration with a
                straight face, wildlife with genuine oddities in it, feminist designs
                that do not soften themselves for the room, witchy and gothic work,
                and self-love statements that sound like something a friend would
                actually say.
              </p>
              <p>
                The rule is simple: if a design would not make me laugh, nod, or
                slightly raise my eyebrows, it does not get drawn.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ 7 · FOUR THINGS THAT DO NOT MOVE ══════════════════════════════════
          45/55: heading and intro left, the four principles as ruled rows right.
          The image below overlaps back under the heading column on desktop, so
          the section reads as one composition rather than a list then a picture. */}
      <section className={`${SHELL} py-14 md:py-20`}>
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <Reveal>
              <p className="type-label mb-6 text-neutral-500">What holds</p>
              <h2
                style={{ color: 'var(--color-ink)' }}
                className="type-h2 leading-[1.08] tracking-[-0.02em]"
              >
                Four things
                <br />
                that do not
                <br />
                move
              </h2>
            </Reveal>
          </div>

          <div className="md:col-span-7">
            <ul>
              {PRINCIPLES.map((p, i) => {
                const active = i === activePrinciple;
                return (
                  <li key={p.n} className="border-t border-[#EAE6DF] last:border-b">
                    <button
                      type="button"
                      onMouseEnter={() => setActivePrinciple(i)}
                      onFocus={() => setActivePrinciple(i)}
                      onClick={() => setActivePrinciple(i)}
                      aria-pressed={active}
                      className="flex w-full items-start gap-6 py-7 text-left focus-visible:outline-none md:py-8"
                    >
                      <span
                        className={`type-label shrink-0 pt-1 transition-colors duration-200 ${
                          active ? 'text-accent-ink' : 'text-neutral-300'
                        }`}
                      >
                        {p.n}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`type-h3 block text-[18px] transition-colors duration-200 md:text-[20px] ${
                            active ? 'text-accent-ink' : ''
                          }`}
                          style={active ? undefined : { color: 'var(--color-ink)' }}
                        >
                          {p.title}
                        </span>
                        <span
                          className={`type-body mt-2 block max-w-[46ch] text-neutral-500 transition-opacity duration-200 ${
                            active ? 'opacity-100' : 'opacity-60'
                          }`}
                        >
                          {p.body}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* The large image, pulled left under the heading column. */}
        <Reveal className="mt-14 md:mt-20">
          <Frame
            src={kidsBanner}
            alt=""
            sizes="(max-width: 768px) 100vw, 92vw"
            fit="contain"
            className="aspect-[2/1] w-full sm:aspect-[21/9]"
          />
        </Reveal>
      </section>

      {/* ══ 8 · PRINT-ON-DEMAND ═══════════════════════════════════════════════
          Split composition: image left, copy right, figures beneath. */}
      <section className={`${SHELL} py-14 md:py-20`}>
        <div className="grid gap-10 md:grid-cols-12 md:items-start md:gap-10">
          {/* Held at 5 of 12 whether or not the file exists, so the copy
              beside it keeps its measure. The column used to widen to 8 when
              the image was missing, which silently re-set the line length of
              the section's longest passage. */}
          <Reveal className="md:col-span-6 lg:col-span-5">
            <Frame
              src={adultBanner}
              alt=""
              sizes="(max-width: 768px) 100vw, 42vw"
              fit="contain"
              className="aspect-[4/3] w-full"
            />
          </Reveal>

          <div className="md:col-span-6 lg:col-span-6 lg:col-start-7">
            <Reveal delay={0.05}>
              <p className="type-label mb-6 text-neutral-500">How it is made</p>
              <h2
                style={{ color: 'var(--color-ink)' }}
                className="type-h2 leading-[1.08] tracking-[-0.02em]"
              >
                Why
                <br />
                Print-on-
                <br />
                Demand?
              </h2>
              <div className="type-body mt-9 max-w-[54ch] space-y-5 text-neutral-500">
                <p>
                  Nothing here is made until you order it. That means no warehouse of
                  guesses, no boxes of the wrong sizes in the wrong colours, and no end
                  of season pile that gets discounted to nothing and then thrown away.
                  The garment that gets printed is the one someone actually wanted.
                </p>
                <p>
                  It also means I can draw something on a Tuesday and offer it on a
                  Wednesday, in every size, without gambling a month of income on
                  whether it sells. A small studio gets to be adventurous — which is the
                  whole reason to run one.
                </p>
                <p>
                  The trade is a few extra days between your order and your doorstep. I
                  think that is a fair swap for a shirt nobody else has and a shirt that
                  was never going to end up in landfill.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ 8b · THE FIGURES ══════════════════════════════════════════════════
          Their own short band between two long reads. Inside the print-on-
          demand section they read as a footnote to that argument; standing
          alone they are the one place on the page the eye crosses in a second. */}
      <section className={`${SHELL} py-10 md:py-14`}>
      {/* Typographic figures, not statistic cards.
          Both counts are the live Etsy listings — see the note in page.tsx.
          Labelled "designs" because that is what they are; there is no city,
          customer or country figure here, because no such data exists. */}
      <Reveal delay={0.05}>
        <dl className="grid grid-cols-1 border-y border-[#EAE6DF] sm:grid-cols-3">
          {[
            { v: String(designCounts.adult), l: 'Adult designs' },
            { v: String(designCounts.kids), l: 'Kids designs' },
            { v: '1', l: 'Person drawing them' },
          ].map((s) => (
            <div
              key={s.l}
              className="border-b border-[#EAE6DF] py-7 sm:border-b-0 sm:border-r sm:px-8 sm:py-9 sm:first:pl-0 sm:last:border-r-0"
            >
              <dt className="sr-only">{s.l}</dt>
              <dd>
                <span
                  className="type-stat block leading-[0.9]"
                  style={{ color: 'var(--color-ink)' }}
                >
                  {s.v}
                </span>
                <span className="type-caption mt-3 block uppercase tracking-[0.18em] text-neutral-400">
                  {s.l}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
      </section>

      {/* ══ 9 · UNRWLY + UNRWLY KIDS ══════════════════════════════════════════
          A brand-extension moment: the lockup large, the relationship explained
          beside it, and the two storefronts shown as a pair of images. */}
      <section className={`${SHELL} py-14 md:py-20`}>
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <Reveal>
              <p className="type-label mb-6 text-neutral-500">Two shops, one desk</p>
              <h2
                style={{ color: 'var(--color-ink)' }}
                className="type-h2 uppercase leading-[1.05] tracking-[-0.02em]"
              >
                UNRWLY
                <span className="mt-2 block text-accent">+</span>
                UNRWLY Kids
              </h2>
            </Reveal>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <Reveal delay={0.05}>
              <div className="type-body max-w-[56ch] space-y-5 text-neutral-500">
                <p>
                  UNRWLY Kids came out of the same sketchbook. Same hands, same ink,
                  same refusal to be boring — just aimed at people who are three feet
                  tall and have strong opinions about dinosaurs.
                </p>
                <p>
                  Every kids design is unisex. Not as a marketing position — it is just
                  obviously correct. A kid who loves capybaras, tigers, pink, green,
                  glitter and mud should be able to have all of it, and should not have
                  to walk past a wall of clothes sorted into who is allowed to like
                  what. So the Kids shop is sorted by what is actually on the shirt:
                  Dinosaur World, Capybara Club, Cats &amp; Mischief, Woodland Friends.
                </p>
                <p>
                  The two shops are separate on Etsy and separate here — you are
                  currently in the <strong className="font-semibold text-ink">{label}</strong>{' '}
                  store, and the toggle at the top of the page moves you between them —
                  but they are one brand, run by one person, from one desk.
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal className="mt-14 grid gap-4 sm:grid-cols-2 md:mt-20">
          <Frame
            src={adultBanner}
            alt=""
            sizes="(max-width: 640px) 100vw, 46vw"
            fit="contain"
            className="aspect-[3/4] w-full sm:aspect-[4/5]"
          />
          {/* Offset down a step, so the pair reads as a composition rather
              than two tiles in a row. */}
          <Frame
            src={kidsBanner}
            alt=""
            sizes="(max-width: 640px) 100vw, 46vw"
            fit="contain"
            className="aspect-[3/4] w-full sm:mt-12 sm:aspect-[4/5]"
          />
        </Reveal>
      </section>

      {/* ══ 10 · ELSEWHERE ════════════════════════════════════════════════════ */}
      <section className={`${SHELL} py-12 md:py-16`}>
        <Reveal>
          <div className="grid gap-8 border-t border-[#EAE6DF] pt-14 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-4">
              <p className="type-label mb-5 text-neutral-500">Elsewhere</p>
              <h2 style={{ color: 'var(--color-ink)' }} className="type-h3 max-w-[12ch]">
                Find UNRWLY Elsewhere
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-6">
              <p className="type-body max-w-[52ch] text-neutral-500">
                The {label.toLowerCase()} shop trades on Etsy as{' '}
                <span className="font-semibold text-ink">{shopName}</span>, where
                you can read the reviews in full. Everything else is where the new
                work gets posted first.
              </p>
              <div className="mt-8">
                <SocialLinks variant="prominent" />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══ 11 · CLOSING ══════════════════════════════════════════════════════
          A full-bleed image, the manifesto over it, and the two shops as the
          last thing on the page. Every manifesto line appears verbatim earlier
          — it is a reprise, which is what lets it be set this large. */}
      <section className="relative">
        {/* The frame is unconditional: the manifesto and its scrim are
            absolutely positioned over this, so if the image were dropped the
            section would collapse to zero height and white text would land on
            the page ground, invisible. The empty plate keeps the height and the
            scrim keeps the contrast either way. */}
        <Frame
          src={studioImage}
          alt=""
          sizes="100vw"
          className="aspect-[4/5] max-h-[86vh] w-full sm:aspect-[16/9]"
        />

        {/* Scrim, so the type keeps its contrast whatever the photograph does
            underneath it. */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/15" />

        <div className={`${SHELL} absolute inset-x-0 bottom-0`}>
          <div className="pb-12 md:pb-20">
            <div className="space-y-1 md:space-y-2">
              {[
                'Designs with a point of view.',
                'Drawn by hand. Mine.',
                'Made only when you order it.',
                'Slightly unruly. Better that way.',
              ].map((line, i) => (
                <Reveal key={line} delay={i * 0.08}>
                  <p className="type-h3 max-w-[36ch] leading-[1.25] text-white">{line}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.3}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  href="/collections/all"
                  className="type-button group inline-flex h-[54px] items-center justify-center gap-2 rounded-full bg-white px-8 text-[13px] uppercase tracking-[0.12em] text-ink transition-[transform,background-color] duration-[250ms] ease-out hover:-translate-y-0.5 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  Shop UNRWLY
                  <ArrowRight size={16} strokeWidth={2} className="transition-transform duration-[250ms] ease-out group-hover:translate-x-1 motion-reduce:transition-none" />
                </Link>
                <Link
                  href="/collections/all?audience=kids"
                  className="type-button group/kids inline-flex h-[54px] items-center justify-center gap-2 rounded-full border border-white/60 px-8 text-[13px] uppercase tracking-[0.12em] text-white transition-[background-color,border-color] duration-[250ms] ease-out hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2"
                >
                  Shop UNRWLY Kids
                  <ArrowRight size={16} strokeWidth={2} className="transition-transform duration-[250ms] ease-out group-hover/kids:translate-x-1 motion-reduce:transition-none" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
