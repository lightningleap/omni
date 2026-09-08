"use client";

import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import BrandMark from '@/components/BrandMark';

/**
 * The checkout's own header, replacing the storefront navbar for this one route.
 *
 * Three things and no more: the way back, the mark, and the fact that this is
 * secure. Every other navbar affordance — search, category menus, the storefront
 * toggle, the cart drawer — is a way out of a page the shopper has deliberately
 * entered to finish, and the drawer in particular would open the cart on top of
 * the page that already shows the cart.
 *
 * The mark still links home, so this is a focused header rather than a trap.
 */
export default function CheckoutHeader() {
  return (
    <header className="border-b border-[#EAE6DF] bg-white/80 backdrop-blur-[10px]">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-4 px-4 md:h-20 md:px-12">
        <Link
          href="/collections/all"
          className="type-caption group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-neutral-500 transition-colors duration-200 hover:text-accent-ink focus-visible:outline-none focus-visible:text-accent-ink"
        >
          <ArrowLeft
            aria-hidden
            size={14}
            strokeWidth={2}
            className="transition-transform duration-200 ease-out group-hover:-translate-x-0.5"
          />
          <span className="hidden sm:inline">Continue shopping</span>
          <span className="sm:hidden">Back</span>
        </Link>

        <Link href="/" aria-label="UNRWLY — home" className="shrink-0">
          <BrandMark size="sm" />
        </Link>

        {/* Stated once, quietly. A row of security badges on a checkout reassures
            nobody and reads as protesting too much. */}
        <p className="type-caption inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
          <Lock aria-hidden size={13} strokeWidth={2} />
          <span className="hidden sm:inline">Secure checkout</span>
        </p>
      </div>
    </header>
  );
}
