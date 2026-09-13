"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useCartStore } from '@/store/useCartStore';
import { ArrowRight, Loader2, Info } from 'lucide-react';
import Link from 'next/link';
import CheckoutHeader from '@/components/checkout/CheckoutHeader';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import EmptyBagMark from '@/components/cart/EmptyBagMark';
import CheckoutSkeleton from '@/components/checkout/CheckoutSkeleton';
import OrderSummaryPanel from '@/components/checkout/OrderSummaryPanel';

/**
 * Checkout — contact, shipping and payment, on this page.
 *
 * ── THE FLOW ────────────────────────────────────────────────────────────────
 * On mount the page asks `/api/checkout` for a PaymentIntent. That endpoint
 * re-prices every line from the database (the client sends product ids and
 * quantities and nothing that can move money), creates a PENDING order and
 * returns a client secret. Stripe's Address and Payment Elements then render
 * inside this page, and `confirmPayment` sends the shopper to the success page.
 *
 * The order is marked PAID by the webhook, never by the browser — see
 * `CheckoutForm`.
 *
 * ── ONE INTENT PER CART ─────────────────────────────────────────────────────
 * The intent is created once per distinct cart, not on every render. Creating
 * one per render would leave a trail of abandoned PENDING orders in the
 * database and a matching trail of uncaptured intents in Stripe.
 */

// Created once at module scope, as Stripe requires — calling `loadStripe`
// inside the component would re-download the SDK on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const { items } = useCartStore();
  const searchParams = useSearchParams();
  const wasCanceled = searchParams.get('canceled') === '1';

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [serverTotal, setServerTotal] = useState<number | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const unitCount = items.reduce((total, item) => total + item.quantity, 0);

  // The server's figure wins when the two disagree — it is the amount actually
  // being charged, and the shopper must see what they are paying.
  const displayTotal = serverTotal ?? subtotal;

  // A stable description of the cart, so the intent is re-created when the
  // contents genuinely change and not merely when the component re-renders.
  const cartKey = useMemo(
    () => items.map((i) => `${i.id}:${i.quantity}`).sort().join('|'),
    [items]
  );

  const createIntent = useCallback(async () => {
    if (!cartKey) return;
    // No eager `setInitError(null)` here. It ran synchronously before the first
    // await, which meant the effect below set state during its own body — the
    // cascading-render pattern `react-hooks/set-state-in-effect` exists to
    // catch. The error is cleared on success instead, which is also the more
    // honest behaviour: a previous failure stays on screen until something
    // actually succeeds, rather than blinking away the moment a retry starts.
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        // The API returns a plain-language reason for the cases a shopper can
        // act on — a product that went out of stock, a bad quantity — so it is
        // shown as-is rather than replaced with a generic failure.
        setInitError((await res.text()) || 'We could not start checkout. Please try again.');
        return;
      }

      const data = await res.json();
      setInitError(null);
      setClientSecret(data.clientSecret);
      if (typeof data.amount === 'number') setServerTotal(data.amount);
    } catch {
      setInitError('Something went wrong reaching our payment provider. Please try again.');
    }
    // `items` is intentionally not a dependency — `cartKey` is its stable
    // fingerprint, and depending on the array itself would re-run this on every
    // store emission.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see below
    void createIntent();
  }, [createIntent]);
  //
  // WHY THE RULE IS SUPPRESSED HERE RATHER THAN SATISFIED
  // `set-state-in-effect` is aimed at state derived from props or other state,
  // which should be computed during render instead. This is neither: it is a
  // network request whose result cannot exist until the component mounts.
  //
  // The usual escape — create the PaymentIntent on the server and pass the
  // client secret down as a prop — is not available, because the intent's
  // amount comes from the cart and the cart lives in `localStorage`. The server
  // cannot see it, so the request can only be made from the browser, after
  // mount. There is no render-time formulation of "ask Stripe for a secret".
  //
  // The eager `setInitError(null)` that used to run synchronously inside
  // `createIntent` HAS been removed — that part of the warning was real. What
  // remains is the fetch itself, which is the intended use of an effect.

  /**
   * Stripe's Elements, wearing the site's own design tokens.
   *
   * The values are read off the document at runtime rather than written out
   * here, so the form inherits whichever storefront is active — an Adult
   * checkout focuses in mint, a Kids one in its own accent — and it cannot
   * drift from `globals.css` the way a second copy of the palette would.
   */
  const appearance = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    const css = getComputedStyle(document.documentElement);
    const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;

    return {
      variables: {
        colorPrimary: token('--accent-700', '#3E715C'),
        colorText: token('--color-ink', '#1A1A1A'),
        colorTextSecondary: '#737373',
        colorBackground: '#FFFFFF',
        colorDanger: token('--brand-terracotta', '#D97757'),
        fontFamily: css.getPropertyValue('--ads-font').trim() || 'system-ui, sans-serif',
        borderRadius: '4px',
        spacingUnit: '4px',
      },
      /**
       * ── THE ONLY LEVER THAT REACHES THE FIELDS ─────────────────────────
       * Every input on this page is inside a Stripe iframe, so no stylesheet
       * in this project can touch one. These rules are the entire styling
       * surface for the email box, the address fields, the country select and
       * the payment method rows. The cards around them are ours; everything
       * within is themed from here.
       *
       * Selectors are Stripe's own, not CSS of ours — `.AccordionItem` is the
       * payment method row `layout: 'accordion'` renders.
       */
      rules: {
        '.Input': {
          border: '1px solid #EAE6DF',
          boxShadow: 'none',
          padding: '11px 13px',
          fontSize: '14px',
        },
        '.Input:focus': {
          border: `1px solid ${token('--accent-700', '#3E715C')}`,
          // A ring rather than a thicker border: a border that grows on focus
          // moves the text inside it by a pixel.
          boxShadow: `0 0 0 3px ${token('--accent-700', '#3E715C')}26`,
        },
        '.Input--invalid': {
          border: `1px solid ${token('--brand-terracotta', '#D97757')}`,
          boxShadow: 'none',
        },
        '.Label': {
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#737373',
        },
        '.Error': {
          fontSize: '12px',
          color: token('--brand-terracotta', '#D97757'),
        },
        // ── PAYMENT METHOD ROWS ──────────────────────────────────────────
        // Unselected rows sit on the same hairline as our cards; the selected
        // one takes the accent border and a wash of it. Selection is never
        // colour alone — Stripe draws a radio in every row and expands the one
        // that is chosen.
        '.AccordionItem': {
          border: '1px solid #EAE6DF',
          boxShadow: 'none',
          padding: '14px',
          transition: 'background-color 200ms ease-out, border-color 200ms ease-out',
        },
        '.AccordionItem:hover': {
          backgroundColor: '#FAFAF8',
        },
        '.AccordionItem--selected': {
          border: `1px solid ${token('--accent-700', '#3E715C')}`,
          backgroundColor: `${token('--accent-700', '#3E715C')}0A`,
          color: token('--color-ink', '#1A1A1A'),
        },
        '.Tab': {
          border: '1px solid #EAE6DF',
          boxShadow: 'none',
        },
        '.Tab--selected': {
          border: `1px solid ${token('--accent-700', '#3E715C')}`,
          backgroundColor: `${token('--accent-700', '#3E715C')}0A`,
        },
      },
    } as const;
  }, []);

  if (items.length === 0) {
    return (
      <>
        <CheckoutHeader />
        <div className="mx-auto flex min-h-[70vh] max-w-[1180px] flex-col items-center justify-center gap-8 px-4 py-24 text-center md:px-12">
          {/* The same looping mark the cart drawer shows, shared via
              `EmptyBagMark`. It replaces a static lucide bag in a bordered
              circle: an empty state is the one screen with nothing else moving
              on it, so it is where a little life is worth the most. The copy
              below is this page's own and is unchanged — only the mark and the
              button are shared. */}
          <EmptyBagMark />
          <div className="space-y-3">
            <h1 className="type-h3 text-[24px] text-ink">Your bag is empty</h1>
            <p className="type-body mx-auto max-w-[38ch] text-[15px] text-neutral-500">
              Nothing to check out yet. Have a look at what is in the shop.
            </p>
          </div>
          <Link
            href="/collections/all"
            className="btn-commerce group"
          >
            Start shopping
            <ArrowRight aria-hidden size={15} strokeWidth={2} className="transition-transform duration-[250ms] ease-out group-hover:translate-x-1 motion-reduce:transition-none" />
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <CheckoutHeader />

      <div className="mx-auto max-w-[1180px] px-4 pb-40 pt-10 md:px-12 md:pb-24 md:pt-16">
        {/* 26px, not `.type-h2`. That token runs to 48px — a homepage hero
            step — and a checkout is a form, not a landing page: the heading
            only has to name the screen. */}
        <h1 className="type-h3 text-[26px] font-semibold text-ink md:text-[32px]">Checkout</h1>
        <p className="type-caption mt-3 text-neutral-500">
          {unitCount} {unitCount === 1 ? 'item' : 'items'}
        </p>

        {wasCanceled && (
          <div role="status" className="mt-8 flex items-start gap-3 border border-[#EAE6DF] bg-white px-5 py-4">
            <Info aria-hidden size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-neutral-400" />
            <p className="type-body text-neutral-500">
              Payment was cancelled and nothing has been charged. Your bag is
              exactly as you left it.
            </p>
          </div>
        )}

        {/* ── THE WORKSPACE ─────────────────────────────────────────────
            Two branches, one layout. Once the intent exists, `CheckoutForm`
            owns the whole grid — form on the left, summary on the right — so
            the Pay button can live under the total and still be a real submit
            control. Before it exists, the same grid is drawn here with a
            skeleton on the left and the summary on the right, so the page does
            not change shape when the Elements mount. */}
        <div className="mt-8">
          {clientSecret && !initError ? (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
              <CheckoutForm email="" subtotal={displayTotal} items={items} />
            </Elements>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start lg:gap-10">
              {initError ? (
                <div
                  role="alert"
                  className="rounded-panel border border-[#E7D3CB] bg-[#FBF3F0] p-5 md:p-7"
                >
                  <p className="text-[13px] leading-relaxed text-brand-terracotta">{initError}</p>
                  <button
                    type="button"
                    onClick={() => void createIntent()}
                    className="btn-commerce-secondary mt-5"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <CheckoutSkeleton />
              )}

              {/* The summary is real even here: the bag is in localStorage, so
                  it needs nothing from the server. Only the action waits. */}
              <OrderSummaryPanel
                items={items}
                total={displayTotal}
                cta={
                  <div className="hidden lg:block">
                    <button type="button" disabled className="btn-commerce w-full">
                      <Loader2
                        aria-hidden
                        size={15}
                        strokeWidth={2}
                        className="animate-spin motion-reduce:animate-none"
                      />
                      Preparing checkout…
                    </button>
                  </div>
                }
              />
            </div>
          )}
        </div>
      </div>

    </>
  );
}
