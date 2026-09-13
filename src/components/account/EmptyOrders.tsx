import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * No orders yet.
 *
 * The mark reuses the cart drawer's `cart-empty-anim` loop rather than
 * introducing a second empty-state animation: a parcel settling into place,
 * continuously, on transform and opacity only. One idle animation language for
 * the whole site is the point — a different wobble on every empty screen is how
 * a design system stops being one.
 *
 * `globals.css` freezes it under `prefers-reduced-motion`, and it is drawn so
 * the still frame reads correctly on its own.
 */
export default function EmptyOrders() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="cart-empty-anim text-accent" aria-hidden="true">
        <svg
          viewBox="0 0 96 96"
          fill="none"
          width={88}
          height={88}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* The label, settling onto the parcel */}
          <g data-cart-anim="drop" opacity={0.55}>
            <rect x="38" y="46" width="20" height="14" rx="2" />
            <path d="M42 51h12M42 55h7" opacity={0.6} />
          </g>

          {/* Lid seam, lifting fractionally as the label arrives */}
          <path
            data-cart-anim="handle"
            d="M20 40h56"
            opacity={0.5}
            style={{ transformOrigin: '48px 40px' }}
          />

          {/* The parcel */}
          <path d="M20 32h56v40a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4z" opacity={0.75} />
          <path d="M48 32v44" opacity={0.35} />
        </svg>
      </div>

      <h3 className="mt-6 text-[18px] font-semibold text-ink">No orders yet</h3>
      <p className="mt-2 max-w-[34ch] text-[13px] leading-relaxed text-neutral-500">
        When you place an order it will appear here, with its progress and
        tracking.
      </p>

      <Link href="/collections/all" className="btn-commerce group mt-7">
        Continue Shopping
        <ArrowRight
          aria-hidden
          size={15}
          strokeWidth={2}
          className="transition-transform duration-[250ms] ease-out group-hover:translate-x-1 motion-reduce:transition-none"
        />
      </Link>
    </div>
  );
}
