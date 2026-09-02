"use client";

import { Facebook, Instagram } from 'lucide-react';
import { EtsyIcon, PinterestIcon } from '@/components/icons/BrandGlyphs';
import { useBrandPresence } from '@/store/useHomepageMode';
import type { SocialProfile } from '@/data/brand';

/**
 * The shop's social row — one component, every placement.
 *
 * WHY ONE COMPONENT
 * These links used to exist only at the bottom of the footer, and half of them
 * pointed at bare twitter.com / youtube.com rather than at a UNRWLY profile.
 * Now there is a single authored list per storefront mode (see
 * `data/brand/presence.ts`) rendered here, so the trust strip, the Meet UNRWLY
 * page and the footer can never drift apart or show the wrong shop's accounts.
 *
 * MODE-AWARE BY CONSTRUCTION
 * Adult and Kids run separate Etsy shops and separate Pinterest accounts;
 * Instagram and Facebook are single shared accounts. Which is which is decided
 * in the data, not here — this component just renders whatever the active mode
 * lists, in the order it lists them.
 *
 * Every link opens in a new tab (these leave the store) and carries an
 * `aria-label` naming both the brand and the network, because an icon-only link
 * announces as nothing at all otherwise.
 */

const ICONS: Record<SocialProfile['id'], (props: { size?: number; className?: string }) => React.ReactElement> = {
  etsy: EtsyIcon,
  pinterest: PinterestIcon,
  instagram: (props) => <Instagram size={props.size} className={props.className} strokeWidth={1.8} />,
  facebook: (props) => <Facebook size={props.size} className={props.className} strokeWidth={1.8} />,
};

/**
 * Three treatments, one set of links:
 *
 *  • `labelled` — the Follow UNRWLY block. A wide pill carrying the icon AND the
 *    network's name. The shop's whole case rests on people going and looking at
 *    the Etsy page, and an unlabelled glyph asks the visitor to recognise a mark
 *    before they will click it. Naming them removes that step.
 *  • `prominent` — a circular icon button, still a real tap target.
 *  • `subtle`  — the footer's quieter inline row.
 */
export type SocialLinksVariant = 'labelled' | 'prominent' | 'subtle';

/** Short display names for the `labelled` treatment. */
const NAMES: Record<SocialProfile['id'], string> = {
  etsy: 'Etsy',
  instagram: 'Instagram',
  pinterest: 'Pinterest',
  facebook: 'Facebook',
};

export default function SocialLinks({
  variant = 'prominent',
  size,
  className = '',
}: {
  variant?: SocialLinksVariant;
  /** Glyph size in px. Defaults to 20. */
  size?: number;
  className?: string;
}) {
  const { socials } = useBrandPresence();
  const glyph = size ?? 20;

  const chrome: Record<SocialLinksVariant, string> = {
    // 54px tall, matching the site's primary buttons — comfortably past the 44px
    // touch-target floor, and it reads as a button rather than as an ornament.
    labelled:
      'flex h-[54px] items-center justify-center gap-2.5 rounded-full border border-[#EAE6DF] bg-white px-6 text-[13px] uppercase tracking-[0.1em] text-[#1A1A1A] shadow-[0_2px_10px_-6px_rgba(20,20,25,0.20)] transition-[background-color,color,border-color,transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-accent-on hover:shadow-[0_12px_24px_-12px_rgb(var(--accent-ring-rgb)/0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
    prominent:
      'flex h-12 w-12 items-center justify-center rounded-full border border-[#EAE6DF] bg-white text-accent-800 shadow-[0_2px_10px_-6px_rgba(20,20,25,0.20)] transition-[background-color,color,transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-accent hover:text-accent-on hover:shadow-[0_12px_24px_-12px_rgb(var(--accent-ring-rgb)/0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
    subtle:
      'flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors duration-200 hover:bg-black/[0.04] hover:text-[#1A1A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
  };

  const labelled = variant === 'labelled';

  return (
    <ul className={`flex flex-wrap items-center ${labelled ? 'gap-3' : 'gap-3'} ${className}`}>
      {socials.map((social) => {
        const Icon = ICONS[social.id];
        return (
          <li key={social.id}>
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              title={social.label}
              className={`${chrome[variant]} ${labelled ? 'type-button' : ''}`}
            >
              <Icon size={glyph} />
              {labelled && <span>{NAMES[social.id]}</span>}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
