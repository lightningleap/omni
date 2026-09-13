/**
 * "Preview your live storefront" — a browser window whose page settles into
 * place as a cursor arrives and clicks.
 *
 * ── WHY THE viewBox IS 128×80 ───────────────────────────────────────────────
 * It renders inside an 80px-tall box, so a 128×80 viewBox maps 1 user unit to
 * 1 CSS pixel. `strokeWidth={1.5}` therefore draws at exactly 1.5px — the
 * weight it was chosen for.
 *
 * The first version used a 64×40 viewBox in that same box, which upscaled
 * everything 2× and rendered those strokes at ~3px: heavy, and coarse, because
 * 40 vertical units is not enough resolution to place anything precisely. The
 * geometry below is drawn at the size it is displayed.
 *
 * Everything strokes in `currentColor`, so the illustration inherits the card's
 * own `text-neutral-400 → group-hover:text-accent-700` transition and can never
 * introduce a colour the dashboard does not already use.
 *
 * Motion lives in `globals.css` against the `data-anim` attributes. Under
 * `prefers-reduced-motion: reduce` every loop freezes with full opacity, which
 * is why each element is drawn to read correctly standing still.
 */
export default function StorefrontAnimation() {
  return (
    <svg
      viewBox="0 0 128 80"
      fill="none"
      aria-hidden="true"
      className="admin-anim h-full w-auto"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Window frame */}
      <rect x="14" y="14" width="100" height="52" rx="5" opacity={0.4} />

      {/* Chrome: divider, traffic lights, address field */}
      <path d="M14 27h100" opacity={0.28} />
      <circle cx="22" cy="20.5" r="1.6" opacity={0.4} />
      <circle cx="28.5" cy="20.5" r="1.6" opacity={0.4} />
      <circle cx="35" cy="20.5" r="1.6" opacity={0.4} />
      <rect x="44" y="17.5" width="60" height="6" rx="3" opacity={0.2} />

      {/* The page — a hero band over two product tiles */}
      <g data-anim="reveal">
        <rect x="22" y="33" width="84" height="16" rx="2.5" opacity={0.22} />
        <rect x="22" y="53" width="39" height="7" rx="2" opacity={0.42} />
        <rect x="67" y="53" width="39" height="7" rx="2" opacity={0.42} />
      </g>

      {/* Cursor — glides in, presses, returns */}
      <g data-anim="cursor">
        <path
          d="M62 40.5v13l3.4-3.4h4.8z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={1.2}
        />
      </g>
    </svg>
  );
}
