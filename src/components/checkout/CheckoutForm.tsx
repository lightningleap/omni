"use client";

import { useState } from 'react';
import {
  AddressElement,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { ArrowRight, Loader2, Lock } from 'lucide-react';
import CheckoutCard from './CheckoutCard';
import OrderSummaryPanel, { type SummaryItem } from './OrderSummaryPanel';

/**
 * The checkout: contact, shipping and payment, on our own page.
 *
 * ── WHY THIS COMPONENT OWNS BOTH COLUMNS ───────────────────────────────────
 * The form wraps the whole two-column grid, summary included. That is what lets
 * the Pay button sit under the total in the right-hand panel and still be an
 * ordinary submit button carrying the real submitting state.
 *
 * The alternative — form on the left, button on the right joined by the HTML
 * "form" attribute — works, but it splits one control's state across two
 * subtrees for no gain. Wrapping the grid costs nothing: a form is a block
 * container, and the grid is declared on the element inside it.
 *
 * ── WHY STRIPE'S ELEMENTS AND NOT OUR OWN INPUTS ───────────────────────────
 * Hand-built card fields would put a raw card number into this origin's DOM,
 * which drags the whole site into PCI-DSS scope and is the one thing an
 * e-commerce front end must never do. PaymentElement renders Stripe-hosted
 * iframes: the fields look native, but the card data goes straight to Stripe
 * and never enters our JavaScript.
 *
 * AddressElement is used for the same class of reason, minus the compliance
 * part: it already handles per-country address shapes (a UK postcode, an Indian
 * PIN, a US ZIP+4), localised labels, and autocomplete. Hand-rolling
 * "City / State / Postal Code" produces a form that is subtly wrong in three of
 * the four countries this shop ships to.
 *
 * ── WHAT THAT MEANS FOR STYLING ────────────────────────────────────────────
 * Every field on this page — the email box, the name, the country select, the
 * address lines, the payment method rows — lives inside a Stripe iframe. No CSS
 * written here can reach any of them. They are themed exclusively through the
 * `appearance` object the page passes to Elements, which is built from this
 * site's own CSS custom properties at runtime. The cards, headings, spacing and
 * the Pay button are ours; the inputs inside them are Stripe's, wearing our
 * tokens.
 *
 * ── WHAT MARKS THE ORDER PAID ──────────────────────────────────────────────
 * Not this component. `confirmPayment` redirects to the success page, but the
 * order is only ever moved to PAID by the webhook, from a signed Stripe event.
 * A shopper who closes the tab during the redirect still gets a fulfilled order.
 */
export default function CheckoutForm({
  email,
  subtotal,
  /** Defaulted for the same reason as in `OrderSummaryPanel`. */
  items = [],
}: {
  /** Prefill for a signed-in shopper. Empty string when signed out. */
  email: string;
  subtotal: number;
  items?: SummaryItem[];
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setError(null);

    // Runs the Elements' own validation first, so a missing postcode is
    // reported against the field that is missing it rather than coming back as
    // a generic failure after a network round trip.
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? 'Please check the details above.');
      setIsSubmitting(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    // Reached only when the payment could not even be attempted — a declined
    // card or a failed 3-D Secure step redirects instead. The shopper's typed
    // details are still on screen, which is the whole point of surfacing this
    // rather than navigating away.
    if (confirmError) {
      setError(
        confirmError.message ??
          'We could not complete the payment. No charge has been made — please check your details and try again.'
      );
      setIsSubmitting(false);
    }
  };

  const submit = (
    <SubmitButton isSubmitting={isSubmitting} disabled={!stripe} subtotal={subtotal} />
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start lg:gap-10">
        {/* ── LEFT: the guided form ──────────────────────────────────────── */}
        <div className="space-y-4 md:space-y-5">
          <CheckoutCard step={1} title="Contact" headingId="contact-heading">
            <LinkAuthenticationElement options={{ defaultValues: { email } }} />
          </CheckoutCard>

          <CheckoutCard
            step={2}
            title="Shipping address"
            description="Where the order is going."
            headingId="shipping-heading"
          >
            <AddressElement
              options={{
                mode: 'shipping',
                // The four countries the shop actually ships to — the same list
                // the hosted flow allowed. Offering a country we cannot ship to
                // is a failed order rather than a sale.
                allowedCountries: ['US', 'CA', 'IN', 'GB'],
                fields: { phone: 'always' },
                validation: { phone: { required: 'auto' } },
              }}
            />
          </CheckoutCard>

          <CheckoutCard
            step={3}
            title="Payment"
            description="Billing address is collected with your card details."
            headingId="payment-heading"
          >
            {/* `accordion` keeps card as the default and folds any wallets the
                account has enabled underneath, rather than presenting a row of
                tabs that changes shape depending on the shopper's device.
                WHICH methods appear is decided by the Stripe account, not here
                — this page can neither add nor remove one. */}
            <PaymentElement options={{ layout: 'accordion' }} />
          </CheckoutCard>

          {error && (
            <p
              role="alert"
              className="rounded-panel border border-[#E7D3CB] bg-[#FBF3F0] px-4 py-3 text-[13px] leading-relaxed text-brand-terracotta"
            >
              {error}
            </p>
          )}
        </div>

        {/* ── RIGHT: the summary, carrying the action ────────────────────── */}
        <OrderSummaryPanel
          items={items}
          total={subtotal}
          // Desktop only. On a phone the panel is collapsed at the top of the
          // page, so a CTA inside it would be hidden behind the disclosure —
          // the sticky bar below is the mobile action.
          cta={<div className="hidden lg:block">{submit}</div>}
        />
      </div>

      {/* ── MOBILE STICKY ACTION ─────────────────────────────────────────
          Inside the form, deliberately.
          The first version put this in the page and fired it by calling
          .click() on the submit button through the DOM — which meant the button
          a phone shopper actually presses could not show "Processing…", because
          the submitting state lives in here. A shopper on a slow connection
          would tap, see nothing change, and tap again. Being inside the form
          makes it a real submit button with the real state, and removes the
          DOM-poking entirely.

          The page carries `pb-40`, so this never covers the last field. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#EAE6DF] bg-white/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur-[10px] lg:hidden">
        {submit}
      </div>
    </form>
  );
}

function SubmitButton({
  isSubmitting,
  disabled,
  subtotal,
}: {
  isSubmitting: boolean;
  disabled?: boolean;
  subtotal: number;
}) {
  return (
    <>
      <button
        type="submit"
        disabled={isSubmitting || disabled}
        className="btn-commerce group w-full"
      >
        {/* LOADING — the button keeps its width (it is full-width) and its
            height (`min-height` on `.btn-commerce`), so nothing on the page
            moves when the label swaps. `disabled` above is what actually blocks
            a second submission; this is only what that state looks like. */}
        {isSubmitting ? (
          <>
            <Loader2
              aria-hidden
              size={15}
              strokeWidth={2}
              className="animate-spin motion-reduce:animate-none"
            />
            Processing…
          </>
        ) : (
          <>
            Pay ${subtotal.toFixed(2)}
            <ArrowRight
              aria-hidden
              size={15}
              strokeWidth={2}
              className="transition-transform duration-[250ms] ease-out group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </>
        )}
      </button>
      <p className="mt-3 flex items-center justify-center gap-2 text-[11px] text-neutral-400">
        <Lock aria-hidden size={12} strokeWidth={2} />
        Encrypted and processed securely by Stripe
      </p>
    </>
  );
}
