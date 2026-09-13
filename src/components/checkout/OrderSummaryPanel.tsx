'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export interface SummaryItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

/**
 * The order summary — sticky beside the form on desktop, a disclosure on mobile.
 *
 * ── THE CTA LIVES HERE ──────────────────────────────────────────────────────
 * `cta` is a slot rather than a button this file builds, because the button has
 * to be a real submit control belonging to the checkout form — it carries the
 * submitting state and must block a second press. Passing it in keeps that
 * ownership with the form while putting the button where a shopper looks for
 * it: directly under the total it is about to charge.
 *
 * It is also what lets the loading branch reuse this panel with a disabled
 * placeholder instead of the page rendering two near-identical summaries.
 *
 * ── MOBILE ──────────────────────────────────────────────────────────────────
 * Collapsed by default and placed above the form, showing just the total. Open
 * by default would push the first field a full screen down; below the form
 * would mean scrolling past contact, address and payment to check what you are
 * buying — the one thing people confirm before typing a card number. The mobile
 * CTA is the sticky bar in `CheckoutForm`, not this panel, so nothing important
 * hides behind the collapse.
 */
export default function OrderSummaryPanel({
  /**
   * Defaulted, so a missing prop degrades to an empty list instead of throwing.
   *
   * This is a checkout: a component that white-screens the page because one
   * prop arrived undefined is the wrong trade at any time, and in dev it is a
   * routine one — a partially rebuilt chunk can pair an old caller with a new
   * component and hand this exactly that. The totals below read from `total`,
   * not from this array, so an empty render still shows the shopper what they
   * are being charged.
   */
  items = [],
  total,
  cta,
}: {
  items?: SummaryItem[];
  total: number;
  cta?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <aside
      aria-labelledby="summary-heading"
      className="order-first lg:order-none lg:sticky lg:top-8 lg:self-start"
    >
      <div className="rounded-panel border border-[#EAE6DF] bg-white p-5 md:p-6">
        {/* Mobile disclosure. Hidden on desktop, where the panel is always open
            and a toggle would be a control that does nothing. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="summary-body"
          className="flex w-full items-center justify-between gap-4 text-left lg:hidden"
        >
          <span className="text-[13px] font-semibold text-ink">
            {open ? 'Hide order summary' : 'Show order summary'}
          </span>
          <span className="flex items-center gap-3">
            <span className="text-[15px] font-bold tabular-nums text-ink">
              ${total.toFixed(2)}
            </span>
            <ChevronDown
              aria-hidden
              size={16}
              strokeWidth={2}
              className={`shrink-0 text-neutral-400 transition-transform duration-200 motion-reduce:transition-none ${
                open ? 'rotate-180' : ''
              }`}
            />
          </span>
        </button>

        <h2
          id="summary-heading"
          className="hidden text-[15px] font-semibold text-ink lg:block"
        >
          Order summary
        </h2>

        <div id="summary-body" className={`${open ? '' : 'hidden'} lg:block`}>
          <ul className="mt-5 divide-y divide-[#EAE6DF] border-y border-[#EAE6DF]">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3 py-3">
                {/* 56px. Large enough to recognise the garment, small enough
                    that a five-item bag does not become a scroll. */}
                <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-card bg-[#F1F1EF]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                  <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-ink">
                    {item.name}
                  </p>
                  {(item.size || item.color) && (
                    <p className="text-[11px] text-neutral-400">
                      {[item.color, item.size].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[11px] text-neutral-400">Qty {item.quantity}</span>
                    <span className="text-[13px] font-semibold tabular-nums text-ink">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[13px] text-neutral-500">Subtotal</dt>
              <dd className="text-[14px] font-semibold tabular-nums text-ink">
                ${total.toFixed(2)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[13px] text-neutral-500">Shipping</dt>
              {/* Not "Free" and not "$0.00". Shipping is settled by Stripe at
                  confirmation, so either would be a number this page does not
                  have. */}
              <dd className="text-right text-[12px] text-neutral-400">Calculated by Stripe</dd>
            </div>
          </dl>

          <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-[#EAE6DF] pt-5">
            <span className="text-[13px] font-semibold text-ink">Total</span>
            {/* 26px. The loudest number on the page and no louder — a 40px
                total on a form reads as a price tag rather than a confirmation. */}
            <span className="text-[26px] font-bold leading-none tracking-[-0.02em] tabular-nums text-ink">
              ${total.toFixed(2)}
            </span>
          </div>

          {cta && <div className="mt-6">{cta}</div>}

          <p className="mt-4 text-[12px] leading-relaxed text-neutral-400">
            <Link
              href="/collections/all"
              className="text-accent-ink underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            >
              Keep shopping
            </Link>{' '}
            — your bag is saved.
          </p>
        </div>
      </div>
    </aside>
  );
}
