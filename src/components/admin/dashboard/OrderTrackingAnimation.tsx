/**
 * "Track the order through fulfilment" — a parcel travelling along a flowing
 * dashed route, past three checkpoints, to a destination pin.
 *
 * ── COMPOSITION ─────────────────────────────────────────────────────────────
 * The parcel sits ON the route, its base resting on the line, and the
 * checkpoints and the pin's tip sit on that same baseline. An earlier version
 * had the parcel drawn 38 units above the route, so it floated across the frame
 * with no relationship to the path it was supposedly following — the one thing
 * this illustration exists to show.
 *
 * Drawn on a 128×80 viewBox so it renders 1:1 in its 80px box and
 * `strokeWidth={1.5}` lands at exactly 1.5px — see the note in
 * `StorefrontAnimation` for why the earlier 64×40 version read as heavy.
 *
 * The parcel has a lid seam and a tape line: three extra strokes are what make
 * it a BOX rather than a rectangle at this size. Being stroke-only, the
 * checkpoints remain visible through it as it passes, which reads correctly.
 *
 * The route is a real dashed stroke whose `stroke-dashoffset` animates, so the
 * line flows rather than the parcel merely sliding over a static rule. Each
 * checkpoint is a hollow ring — always drawn — with a core that brightens as
 * the parcel reaches it, so the journey stays legible when frozen under
 * `prefers-reduced-motion`.
 */
export default function OrderTrackingAnimation() {
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
      {/* The route — the baseline everything else sits on */}
      <path data-anim="dash" d="M12 60h96" strokeDasharray="2 6" opacity={0.35} />

      {/* Checkpoint rings, always drawn */}
      <circle cx="40" cy="60" r="4" opacity={0.3} />
      <circle cx="62" cy="60" r="4" opacity={0.3} />
      <circle cx="84" cy="60" r="4" opacity={0.3} />

      {/* Cores brightening in sequence as the parcel passes */}
      <g fill="currentColor" stroke="none">
        <circle data-anim="pop" cx="40" cy="60" r="2" style={{ transformOrigin: '40px 60px' }} />
        <circle data-anim="pop" data-delay="1" cx="62" cy="60" r="2" style={{ transformOrigin: '62px 60px' }} />
        <circle data-anim="pop" data-delay="2" cx="84" cy="60" r="2" style={{ transformOrigin: '84px 60px' }} />
      </g>

      {/* Destination pin — its tip meets the end of the route */}
      <g opacity={0.5}>
        <path d="M114 44c0-4.4-3.6-8-8-8s-8 3.6-8 8c0 6 8 16 8 16s8-10 8-16z" />
        <circle cx="106" cy="44" r="2.8" />
      </g>

      {/* The parcel — base resting on the route */}
      <g data-anim="travel" style={{ ['--admin-travel' as string]: '62px' }} opacity={0.7}>
        <rect x="14" y="38" width="24" height="20" rx="2.5" />
        <path d="M14 45h24" />
        <path d="M26 38v20" opacity={0.45} />
      </g>
    </svg>
  );
}
