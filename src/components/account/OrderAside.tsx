import { MapPin, Package } from 'lucide-react';
import { parseShippingAddress } from '@/lib/orderStatus';
import CopyTrackingButton from './CopyTrackingButton';

/**
 * The right-hand column of the tracking page: totals, shipping, tracking.
 *
 * ── ONLY FIELDS THE SCHEMA HAS ──────────────────────────────────────────────
 * `Order` stores `totalAmount`, `totalPaid` and `refundedAmount`, and nothing
 * else financial. There is no `subtotal`, no `shippingCost`, no `taxAmount` and
 * no `discount` column, so this panel shows a total and — only where the values
 * are non-zero — what has actually been paid and refunded. Printing "Shipping:
 * $0.00" and "Tax: $0.00" would be inventing two line items the order never
 * recorded, and a customer has no way to tell an invented zero from a real one.
 *
 * Shipping and tracking sections disappear entirely when their columns are
 * null, rather than rendering a heading above an em dash.
 */
export default function OrderAside({
  totalAmount,
  totalPaid,
  refundedAmount,
  shippingAddress,
  trackingNumber,
  carrier,
  trackingUrl,
}: {
  totalAmount: number;
  totalPaid: number | null;
  refundedAmount: number | null;
  shippingAddress: string | null;
  trackingNumber: string | null;
  carrier: string | null;
  trackingUrl: string | null;
}) {
  const ship = parseShippingAddress(shippingAddress);
  const refunded = refundedAmount ?? 0;
  const paid = totalPaid ?? 0;

  return (
    <div className="space-y-8">
      {/* ── TOTALS ─────────────────────────────────────────────────────── */}
      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="type-label mb-4 text-[11px] text-neutral-500">
          Order summary
        </h2>
        <dl className="space-y-2.5 border-t border-[#EAE6DF] pt-4">
          <Row label="Total" value={`$${totalAmount.toFixed(2)}`} strong />
          {paid > 0 && paid !== totalAmount && (
            <Row label="Paid" value={`$${paid.toFixed(2)}`} />
          )}
          {refunded > 0 && <Row label="Refunded" value={`−$${refunded.toFixed(2)}`} />}
        </dl>
      </section>

      {/* ── SHIPPING ───────────────────────────────────────────────────── */}
      {(ship.name || ship.address) && (
        <section aria-labelledby="shipping-heading">
          <h2
            id="shipping-heading"
            className="type-label mb-4 flex items-center gap-2 text-[11px] text-neutral-500"
          >
            <MapPin aria-hidden size={13} strokeWidth={2} />
            Shipping address
          </h2>
          <div className="space-y-1 border-t border-[#EAE6DF] pt-4 text-[13px] leading-relaxed text-neutral-500">
            {ship.name && <p className="font-semibold text-ink">{ship.name}</p>}
            {ship.address && <p>{ship.address}</p>}
            {ship.email && <p className="text-neutral-400">{ship.email}</p>}
          </div>
        </section>
      )}

      {/* ── TRACKING ───────────────────────────────────────────────────── */}
      {trackingNumber && (
        <section aria-labelledby="tracking-heading">
          <h2
            id="tracking-heading"
            className="type-label mb-4 flex items-center gap-2 text-[11px] text-neutral-500"
          >
            <Package aria-hidden size={13} strokeWidth={2} />
            Tracking
          </h2>
          <div className="border-t border-[#EAE6DF] pt-4">
            {carrier && <p className="text-[12px] text-neutral-400">{carrier}</p>}
            <p className="mt-1 break-all font-mono text-[13px] font-semibold text-ink">
              {trackingNumber}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <CopyTrackingButton value={trackingNumber} />
              {/* Only rendered when the order actually stores a URL. A carrier
                  link guessed from the number would send people to the wrong
                  site as often as the right one. */}
              {trackingUrl && (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-commerce-secondary h-9 min-h-0 px-3 text-[12px]"
                >
                  Track shipment
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={`text-[13px] ${strong ? 'font-semibold text-ink' : 'text-neutral-500'}`}>
        {label}
      </dt>
      <dd
        className={`tabular-nums ${
          strong ? 'text-[20px] font-bold text-ink' : 'text-[13px] text-neutral-500'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
