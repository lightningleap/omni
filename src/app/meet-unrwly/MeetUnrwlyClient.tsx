"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import BrandMark from '@/components/BrandMark';
import SocialLinks from '@/components/SocialLinks';
import { useBrandPresence, useHomepageContent, useHomepageMode } from '@/store/useHomepageMode';

/**
 * Meet UNRWLY — the founder, the reasoning, and the way the work is made.
 *
 * WHY THIS PAGE EXISTS
 * Everything else on the site sells a product. This is the page that answers
 * "who am I actually buying from?", which for a one-person illustrated label is
 * the question that decides the sale. It is written the way the shop's own Etsy
 * About reads — first person, direct, a bit dry — rather than rewritten into
 * brand-voice copy, because the plainness is the credential.
 *
 * IT IS NOT AN ARGUMENT. The section on original artwork says what the work IS
 * (drawn by hand, one person, from a real sketchbook), never what it isn't. A
 * page that spends a paragraph denying something plants the doubt it is trying
 * to remove.
 *
 * MODE-AWARE WHERE IT MATTERS. The story is one story — both shops are the same
 * person — so the prose does not switch. What follows the toggle is what should:
 * the shop links at the foot of the page, which point at the Etsy and Pinterest
 * accounts of whichever store the visitor is browsing.
 */

/** A titled prose block. The page is a sequence of these, nothing cleverer. */
function Chapter({
  label,
  title,
  children,
}: {
  label?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 border-t border-[#EAE6DF] py-14 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] md:gap-16 md:py-20">
      <div>
        {label && <p className="type-label mb-4 text-neutral-500">{label}</p>}
        <h2 style={{ color: '#1A1A1A' }} className="type-section-title">
          {title}
        </h2>
      </div>
      <div className="type-body max-w-[66ch] space-y-5 text-[#334155]">{children}</div>
    </section>
  );
}

export default function MeetUnrwlyClient({ founderImage }: { founderImage: string | null }) {
  const { mode } = useHomepageMode();
  const { label } = useHomepageContent();
  const { shopName, etsyUrl } = useBrandPresence();

  return (
    <main className="pb-8">
      <div className="mx-auto max-w-[1180px] px-4 md:px-12">
        {/* ── OPENING ────────────────────────────────────────────────────── */}
        <section className="grid gap-10 py-16 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] md:items-center md:gap-16 md:py-24">
          <div>
            <p className="type-label flex items-center gap-3 text-neutral-500">
              <span aria-hidden className="h-px w-9 bg-accent" />
              The person behind it
            </p>
            <h1 style={{ color: '#1A1A1A' }} className="type-h2 mt-6 uppercase">
              Meet UNRWLY
            </h1>
            <p className="type-h3 mt-4 text-neutral-600">Not just another apparel shop.</p>
            <p className="type-body mt-7 max-w-[60ch] text-[#334155]">
              Hi — UNRWLY is me. One person, a sketchbook, and a stubborn habit of
              turning the things that irritate and delight me into something you
              can wear. I have spent my working life in human rights and policy,
              which is exactly as heavy as it sounds, and I have been drawing the
              whole time. This shop is where the two finally met.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href={mode === 'kids' ? '/collections/all?audience=kids' : '/collections/all'}
                className="type-button group inline-flex h-[54px] items-center justify-center gap-2 rounded-full bg-accent px-8 text-[13px] uppercase tracking-[0.12em] text-accent-on shadow-[0_10px_24px_-12px_rgb(var(--accent-ring-rgb)/0.6)] transition-[transform,background-color,box-shadow] duration-[250ms] ease-out hover:-translate-y-0.5 hover:bg-accent-950 hover:text-accent-on-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                Shop the {label} Collection
                <ArrowRight size={16} strokeWidth={2} className="transition-transform duration-[250ms] ease-out group-hover:translate-x-1 motion-reduce:transition-none" />
              </Link>
              <a
                href={etsyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="type-button group/etsy inline-flex h-[54px] items-center justify-center gap-2 rounded-full border border-neutral-300 px-8 text-[13px] uppercase tracking-[0.12em] text-[#1A1A1A] transition-[background-color,border-color] duration-[250ms] ease-out hover:border-neutral-400 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2"
              >
                Visit the Etsy Shop
                <ArrowUpRight size={16} strokeWidth={2} className="transition-transform duration-[250ms] ease-out group-hover/etsy:translate-x-0.5 group-hover/etsy:-translate-y-0.5 motion-reduce:transition-none" />
              </a>
            </div>
          </div>

          {/* Portrait — or, until one is saved, the brand mark on a plain plate.
              Deliberately NOT a stock photograph of a stranger: on the one page
              whose entire job is "a real person makes this", borrowing someone
              else's face would be the single most self-defeating thing possible.
              Drop a real photo at public/brand/founder.jpg and it appears here. */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-[8px] border border-[#EAE6DF] bg-[#F5F5F2]">
            {founderImage ? (
              <Image
                src={founderImage}
                alt="The founder of UNRWLY in the studio"
                fill
                priority
                sizes="(max-width:768px) 100vw, 420px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-5 px-8 text-center text-[#1A1A1A]">
                <BrandMark size="lg" />
                <p className="type-caption text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                  Drawn by hand · Printed to order
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── WHY UNRWLY EXISTS ──────────────────────────────────────────── */}
        <Chapter label="The reason" title="Why UNRWLY Exists">
          <p>
            I kept seeing the same shirts. Same six jokes, same tidy fonts, same
            inoffensive nothing, printed a million times over. Meanwhile the
            things I actually wanted to say — the small daily absurdities, the
            opinions that make a room go quiet, the affection I have for animals
            that have no business being that strange — were nowhere.
          </p>
          <p>
            So UNRWLY started as the shop I wanted to buy from. Designs with a
            point of view, drawn properly, printed on garments that hold up to
            being worn constantly rather than photographed once.
          </p>
          <p>
            The name is the whole brief, really. Slightly unruly. A little too
            much. Better that way.
          </p>
        </Chapter>

        {/* ── DESIGNED BY A HUMAN ────────────────────────────────────────── */}
        <Chapter label="The work" title="Designed by a Human">
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
        </Chapter>

        {/* ── DESIGNED WITH PERSONALITY ──────────────────────────────────── */}
        <Chapter label="The voice" title="Designed With Personality">
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
        </Chapter>

        {/* ── WHY PRINT-ON-DEMAND ────────────────────────────────────────── */}
        <Chapter label="How it is made" title="Why Print-on-Demand?">
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
        </Chapter>

        {/* ── UNRWLY + UNRWLY KIDS ───────────────────────────────────────── */}
        <Chapter label="Two shops, one desk" title="UNRWLY + UNRWLY Kids">
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
            currently in the <strong className="font-semibold text-[#1A1A1A]">{label}</strong>{' '}
            store, and the toggle at the top of the page moves you between them —
            but they are one brand, run by one person, from one desk.
          </p>
        </Chapter>

        {/* ── FIND UNRWLY ELSEWHERE ──────────────────────────────────────── */}
        <section className="border-t border-[#EAE6DF] py-14 md:py-20">
          <div className="rounded-[8px] border border-[#EAE6DF] bg-[#FCFCFA] px-6 py-12 md:px-12 md:py-14">
            <p className="type-label text-neutral-500">Elsewhere</p>
            <h2 style={{ color: '#1A1A1A' }} className="type-section-title mt-4">
              Find UNRWLY Elsewhere
            </h2>
            <p className="type-body mt-5 max-w-[56ch] text-[#334155]">
              The {label.toLowerCase()} shop trades on Etsy as{' '}
              <span className="font-semibold text-[#1A1A1A]">{shopName}</span>, where
              you can read the reviews in full. Everything else is where the new
              work gets posted first.
            </p>
            <div className="mt-8">
              <SocialLinks variant="prominent" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
