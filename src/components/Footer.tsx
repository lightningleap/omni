"use client";

import Link from "next/link";
import BrandMark from "./BrandMark";
import SocialLinks from "./SocialLinks";

/**
 * The site footer.
 *
 * The social row is now `SocialLinks`, the same component the Etsy trust strip
 * and the Meet UNRWLY page use, reading the same per-mode list from
 * `data/brand/presence.ts` — so Adult shows the Adult Etsy and Pinterest, Kids
 * shows its own pair, and Instagram and Facebook (single shared accounts) appear
 * in both. Flipping the toggle re-renders the row in place: no navigation, no
 * refresh, and no second footer.
 *
 * The row used to include links to twitter.com, instagram.com and youtube.com —
 * the sites' own front pages, not UNRWLY profiles. Those are gone: pointing a
 * customer at Twitter's homepage is not a social presence, and with the icons now
 * given real prominence a dead link is worse than a missing one.
 */
const Footer = () => {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Unrwly';

  return (
    <footer className="bg-white border-t border-gray-100 pt-24 pb-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32">
          
          {/* Column 1: Brand */}
          <div className="space-y-8">
            {/* Same mark as the header and the mobile drawer — see BrandMark. */}
            <Link href="/" aria-label={`${storeName} — home`} className="inline-block text-ink">
              <BrandMark size="lg" />
            </Link>
            <p className="type-body text-neutral-500 max-w-[320px]">
              {storeName} is a small, artist-owned studio. Every design is drawn by hand,
              printed to order on premium material.
            </p>
            <div className="space-y-3">
              <p className="type-label text-neutral-500">Follow UNRWLY</p>
              {/* -ml-2.5 pulls the first icon's 40px hit box back so the glyph
                  itself lines up with the paragraph above it. */}
              <SocialLinks variant="subtle" className="-ml-2.5 gap-0.5" />
            </div>
          </div>

          {/* Column 2: Support */}
          <div className="space-y-8">
            <ul className="space-y-5">
              {/* Same label as the header link — "About", one destination. */}
              <li><Link href="/meet-unrwly" className="type-caption text-slate-500 uppercase tracking-[0.18em] transition-colors hover:text-ink">About</Link></li>
              <li><Link href="/faq" className="type-caption text-slate-500 uppercase tracking-[0.18em] transition-colors hover:text-ink">FAQ</Link></li>
              <li><Link href="/contact" className="type-caption text-slate-500 uppercase tracking-[0.18em] transition-colors hover:text-ink">Connect with Us</Link></li>
              <li><Link href="/policies/refund-policy" className="type-caption text-slate-500 uppercase tracking-[0.18em] transition-colors hover:text-ink">Returns & Store Policies</Link></li>
              {/* Last in the list. Points at the FAQ, which has no AI entry yet —
                  the honest destination for that link until that answer is written. */}
              <li><Link href="/faq" className="type-caption text-slate-500 uppercase tracking-[0.18em] transition-colors hover:text-ink">How We Use AI</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="type-caption text-[11px] text-gray-400 uppercase tracking-[0.18em]">
            &copy; {new Date().getFullYear()} {storeName}. ALL RIGHTS RESERVED.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <Link href="/policies/privacy-policy" className="text-gray-400 hover:text-ink transition-colors type-caption text-[11px] uppercase tracking-[0.18em]">Privacy Policy</Link>
            <Link href="/policies/terms-of-service" className="text-gray-400 hover:text-ink transition-colors type-caption text-[11px] uppercase tracking-[0.18em]">Terms of Service</Link>
            <Link href="/policies/shipping-policy" className="text-gray-400 hover:text-ink transition-colors type-caption text-[11px] uppercase tracking-[0.18em]">Shipping Policy</Link>
            <Link href="/policies/refund-policy" className="text-gray-400 hover:text-ink transition-colors type-caption text-[11px] uppercase tracking-[0.18em]">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
