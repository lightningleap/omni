/**
 * The animated empty-bag illustration, on its own so more than one empty state
 * can use it without inheriting another screen's words.
 *
 * The cart drawer and the checkout page both say "your bag is empty", but they
 * say it differently and offer different ways out — the drawer closes itself,
 * the checkout page navigates. Sharing the MARK and not the copy is what lets
 * both animate identically while each keeps the sentence it was written with.
 *
 * ── THE ANIMATION ───────────────────────────────────────────────────────────
 * A single product tile rises into the bag as the handle lifts, and it never
 * stops — see the `cart-drop` note in `globals.css` for why the keyframes have
 * exactly one turning point. `transform` and `opacity` only, so the compositor
 * handles it and nothing triggers layout.
 *
 * Drawn on a 96×96 viewBox and rendered at its natural size, so
 * `strokeWidth={1.5}` lands at exactly 1.5px. A smaller viewBox scaled up would
 * thicken every stroke, which is what made an earlier set of illustrations read
 * as heavy.
 *
 * Strokes are `currentColor` and the wrapper carries the accent, so the mark
 * takes the active storefront's colour — mint on Adult, the Kids accent on
 * Kids — without this file knowing which shop it is in.
 *
 * ── REDUCED MOTION ──────────────────────────────────────────────────────────
 * `globals.css` freezes both loops at full opacity, so the still frame is a
 * complete bag with a product resting inside it. The meaning never depends on
 * the movement.
 */
export default function EmptyBagMark({ size = 96 }: { size?: number }) {
  return (
    <div className="cart-empty-anim text-accent" aria-hidden="true">
      <svg
        viewBox="0 0 96 96"
        fill="none"
        width={size}
        height={size}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* The product, rising into the bag */}
        <g data-cart-anim="drop" opacity={0.55}>
          <rect x="39" y="34" width="18" height="14" rx="2" />
          <path d="M43 39h10" opacity={0.6} />
        </g>

        {/* Handle — lifts fractionally as the product arrives */}
        <path
          data-cart-anim="handle"
          d="M38 40v-6a10 10 0 0 1 20 0v6"
          opacity={0.5}
          style={{ transformOrigin: '48px 40px' }}
        />

        {/* Bag body */}
        <path d="M28 40h40l3.5 34a5 5 0 0 1-5 5.5H29.5a5 5 0 0 1-5-5.5z" opacity={0.75} />
      </svg>
    </div>
  );
}
