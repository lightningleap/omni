"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import ModeFade from '@/components/home/ModeFade';
import { useBrandPresence, useHomepageMode } from '@/store/useHomepageMode';
import type { HomepageMode } from '@/data/homepage';

// Same floating glass control used by the other horizontal carousels.
const ARROW =
  "hidden md:flex absolute top-1/2 -translate-y-1/2 z-30 h-11 w-11 items-center justify-center rounded-full bg-white/75 backdrop-blur-[16px] border border-white/70 text-accent-ink shadow-[0_10px_30px_rgb(var(--accent-shade-rgb)/0.08)] transition-[background-color,color,transform,box-shadow] duration-200 ease-out hover:bg-accent hover:text-accent-on hover:scale-105 hover:shadow-[0_14px_34px_rgb(var(--accent-shade-rgb)/0.18)] active:scale-95";

/**
 * The community invitation — the shop asking customers to send photos in.
 *
 * ── WHAT CHANGED, AND WHY ───────────────────────────────────────────────────
 * This rail used to present eight invented customers: @maya.wears in London with
 * 2.4K likes, @sofia.rae in New York with 240 comments, and so on. None of them
 * exist. That was harmless-looking placeholder content until the page grew a
 * section directly above it that stakes the brand's whole case on its real
 * reviews and its real 54 orders — at which point a wall of fabricated social
 * proof sitting underneath it is the one thing on the page most likely to make a
 * visitor doubt everything else.
 *
 * So the invented people are gone. What remains is the same rail, the same
 * cards, the same scroll and the same CTAs, presented honestly for what it is:
 * styling photography and an open invitation. The moment real customer photos
 * exist they go in `GALLERY` below — with attribution, because then there will
 * genuinely be someone to attribute them to.
 *
 * ── AND IT NO LONGER LEAKS ──────────────────────────────────────────────────
 * The old set mixed a kids photo into a feed shown in both modes. The two sets
 * are now separate, so the Adult store shows adult styling and the Kids store
 * shows kids — the same rule the rest of the homepage follows.
 *
 * IMAGERY: on-brand placeholders. Drop real photography into `public/community/`
 * and point these at it; keep it shot the same way as the Etsy listings so the
 * two storefronts read as one shop.
 */
const GALLERY: Record<HomepageMode, string[]> = {
  adult: [
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80',
    'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=600&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80',
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80',
  ],
  kids: [
    'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80',
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80',
    'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=80',
    'https://images.unsplash.com/photo-1476234251651-f353703a034d?w=600&q=80',
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&q=80',
    'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600&q=80',
  ],
};

// Slightly larger than the other rails' cards on purpose. For a studio this
// size, the work being worn is the strongest proof the shop is real, so the feed
// carries a little more weight than a footnote.
const CARD = 'shrink-0 snap-start w-[260px] md:w-[300px] aspect-[4/5] rounded-[4px] overflow-hidden';

function MediaCard({ src, alt, priority }: { src: string; alt: string; priority: boolean }) {
  return (
    <div
      className={`group relative ${CARD} shadow-[0_2px_10px_-4px_rgba(20,20,25,0.12)] transition-[transform,box-shadow] duration-[220ms] ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_18px_36px_-16px_rgba(20,20,25,0.30)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        loading={priority ? undefined : 'lazy'}
        sizes="(max-width:768px) 62vw, 300px"
        className="object-cover brightness-100 transition-[filter] duration-[220ms] ease-out group-hover:brightness-[1.05]"
      />
    </div>
  );
}

export default function CommunitySection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { mode } = useHomepageMode();
  const { socials } = useBrandPresence();

  const scroll = (dir: 1 | -1) => trackRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });

  const instagram = socials.find((s) => s.id === 'instagram');
  const images = GALLERY[mode];
  const alt = mode === 'kids' ? 'UNRWLY Kids styling photograph' : 'UNRWLY styling photograph';

  return (
    <ModeFade mode={mode}>
      <section aria-label="Join the UNRWLY community" className="py-16 md:py-20">
        <div className="mx-auto max-w-[1440px] px-4 md:px-12">
          <SectionHeader
            title="Wear It. Share It. Get Featured."
            subtitle={
              <>
                Send us a photo of yours. Tag <span className="text-neutral-700">@Unrwly</span> or use{' '}
                <span className="text-neutral-700">#Unrwly</span> and we will feature you right here —
                we read every one.
              </>
            }
            /* The CTA sits under the description, in the left column, because
               the sentence above it ("Send us a photo of yours…") is what asks
               for the click. On the title row opposite the heading it read as a
               section utility — a sort control or a "view all" — and detached
               from the request that motivates it. */
            footer={
              instagram && (
                <a
                  href={instagram.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="type-button group/up inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-accent px-8 text-[14px] text-accent-on shadow-[0_10px_24px_-12px_rgb(var(--accent-ring-rgb)/0.6)] transition-[transform,background-color,box-shadow] duration-[250ms] ease-out hover:-translate-y-0.5 hover:bg-accent-950 hover:text-accent-on-strong hover:shadow-[0_16px_30px_-12px_rgb(var(--accent-ring-rgb)/0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto"
                >
                  Share Your Look
                  <ArrowRight size={16} strokeWidth={2} className="transition-transform duration-[250ms] ease-out group-hover/up:translate-x-1 motion-reduce:transition-none" />
                </a>
              )
            }
          />

          {/* Gallery */}
          <div className="relative">
            <button aria-label="Previous" onClick={() => scroll(-1)} className={`${ARROW} left-0`}>
              <ChevronLeft size={20} strokeWidth={2.25} />
            </button>
            <button aria-label="Next" onClick={() => scroll(1)} className={`${ARROW} right-0`}>
              <ChevronRight size={20} strokeWidth={2.25} />
            </button>

            <div ref={trackRef} className="no-scrollbar snap-x snap-mandatory overflow-x-auto scroll-smooth px-1 md:px-8">
              <div className="flex w-max gap-[18px] pb-2">
                {images.map((src, i) => (
                  <MediaCard key={src} src={src} alt={alt} priority={i < 3} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </ModeFade>
  );
}
