/**
 * "Products are being synchronized" — product cards travelling into the
 * catalogue, a sync ring turning between them, a tick confirming arrival.
 *
 * Drawn on a 128×80 viewBox so it renders 1:1 in its 80px box and
 * `strokeWidth={1.5}` lands at exactly 1.5px — see the note in
 * `StorefrontAnimation` for why the earlier 64×40 version read as heavy.
 *
 * The cards carry an image block and a text line rather than being plain
 * rectangles: at this size that small amount of internal structure is what
 * makes them read as PRODUCTS rather than as generic boxes, which is the whole
 * point of the illustration.
 *
 * The three share one keyframe and differ only by `data-delay`, staggered by
 * exact thirds so one is always crossing. `--admin-travel` is the only
 * per-instance value the shared keyframe needs.
 */
export default function ProductSyncAnimation() {
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
      {/* Source — product cards entering the pipeline */}
      <g style={{ ['--admin-travel' as string]: '58px' }}>
        <g data-anim="travel" opacity={0.55}>
          <rect x="8" y="14" width="26" height="16" rx="2.5" />
          <rect x="11.5" y="17.5" width="9" height="9" rx="1.5" opacity={0.6} />
          <path d="M24 20.5h6.5M24 24.5h4" opacity={0.6} />
        </g>
        <g data-anim="travel" data-delay="1" opacity={0.55}>
          <rect x="8" y="32" width="26" height="16" rx="2.5" />
          <rect x="11.5" y="35.5" width="9" height="9" rx="1.5" opacity={0.6} />
          <path d="M24 38.5h6.5M24 42.5h4" opacity={0.6} />
        </g>
        <g data-anim="travel" data-delay="2" opacity={0.55}>
          <rect x="8" y="50" width="26" height="16" rx="2.5" />
          <rect x="11.5" y="53.5" width="9" height="9" rx="1.5" opacity={0.6} />
          <path d="M24 56.5h6.5M24 60.5h4" opacity={0.6} />
        </g>
      </g>

      {/* Sync ring — two arcs with arrowheads, turning */}
      <g data-anim="spin" style={{ transformOrigin: '64px 40px' }} opacity={0.5}>
        <path d="M53 40a11 11 0 0 1 18.6-7.9" />
        <path d="M75 40a11 11 0 0 1-18.6 7.9" />
        <path d="M71.8 26.6v5.8h-5.8" />
        <path d="M56.2 53.4v-5.8h5.8" />
      </g>

      {/* Destination — the catalogue */}
      <g opacity={0.45}>
        <ellipse cx="104" cy="24" rx="14" ry="5" />
        <path d="M90 24v32c0 2.8 6.3 5 14 5s14-2.2 14-5V24" />
        <path d="M90 40c0 2.8 6.3 5 14 5s14-2.2 14-5" />
      </g>

      {/* Arrival tick */}
      <g data-anim="pop" style={{ transformOrigin: '104px 52px' }}>
        <path d="M99 52.5l3.4 3.4 6.6-7.4" strokeWidth={2} />
      </g>
    </svg>
  );
}
