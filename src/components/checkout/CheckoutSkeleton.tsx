import CheckoutCard from './CheckoutCard';

/**
 * The left column while the PaymentIntent is being created.
 *
 * ── WHY SKELETONS AND NOT A SPINNER ─────────────────────────────────────────
 * The three cards are already on screen, numbered and titled, so the shopper
 * can see the whole shape of what they are about to do before any of it has
 * loaded. A centred spinner tells them only that something is happening.
 *
 * It also stops the page jumping: the skeleton bars stand in for fields at
 * roughly the height the real ones occupy, so the summary beside them does not
 * leap up the page when the Elements mount.
 *
 * The bars use the existing `animate-pulse`, which Tailwind already disables
 * under `prefers-reduced-motion` — nothing new to opt out of.
 */
export default function CheckoutSkeleton() {
  return (
    <div className="space-y-4 md:space-y-5" aria-hidden="true">
      <CheckoutCard step={1} title="Contact" headingId="skeleton-contact">
        <Field />
      </CheckoutCard>

      <CheckoutCard
        step={2}
        title="Shipping address"
        description="Where the order is going."
        headingId="skeleton-shipping"
      >
        <div className="space-y-4">
          <Field />
          <Field />
          <div className="grid grid-cols-2 gap-3">
            <Field />
            <Field />
          </div>
        </div>
      </CheckoutCard>

      <CheckoutCard step={3} title="Payment" headingId="skeleton-payment">
        <div className="space-y-2.5">
          <Row />
          <Row />
          <Row />
        </div>
      </CheckoutCard>
    </div>
  );
}

/** A label bar over an input bar, at the proportions the real fields use. */
function Field() {
  return (
    <div className="animate-pulse">
      <div className="h-2 w-20 rounded-full bg-[#EFEDE8]" />
      <div className="mt-2 h-11 w-full rounded-card bg-[#F5F4F0]" />
    </div>
  );
}

/** One collapsed payment method row. */
function Row() {
  return <div className="h-12 w-full animate-pulse rounded-card bg-[#F5F4F0]" />;
}
