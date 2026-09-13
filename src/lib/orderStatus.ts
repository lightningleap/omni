/**
 * Order status → customer-facing progress, derived from the real schema.
 *
 * ── THE STATUSES ARE THE SCHEMA'S, NOT INVENTED ─────────────────────────────
 * `OrderStatus` in `prisma/schema.prisma` has eleven values. Five of them form
 * the path an order actually travels — PENDING → PAID → PROCESSING → SHIPPED →
 * DELIVERED — and those five are the timeline. The other six (CANCELLED,
 * REFUNDED, PARTIALLY_REFUNDED, DISPUTED, PAYMENT_FAILED and
 * MANUAL_INTERVENTION_REQUIRED) are not later stages of that path, they are
 * departures from it, so drawing them as steps would be a lie about what
 * happens next. They get a notice instead.
 *
 * ── WHY MOST STEPS CARRY NO DATE ────────────────────────────────────────────
 * This is the important limitation and it is deliberate, not an omission.
 *
 * `Order` stores exactly two timestamps: `createdAt` and `updatedAt`. There is
 * no OrderEvent table, no status history, nothing that records WHEN an order
 * moved to SHIPPED. So the only two moments this application can honestly print
 * are "when the order was placed" (createdAt) and "when the status last
 * changed" (updatedAt, which belongs to the current step and to no other).
 *
 * Every other step returns `at: null` and the UI omits the line. A tracking
 * page that invents "Shipped — 12 Sep, 2:15 PM" from an order that never
 * recorded it is worse than one that says nothing: the customer would have no
 * way to know which of the dates were real.
 *
 * If per-step timestamps are wanted later, they need a schema change — an
 * `OrderEvent { orderId, status, at }` table written wherever status is
 * mutated. This module is where that data would surface.
 */

/** The five statuses that make up the forward path, in order. */
export const TIMELINE_STATUSES = [
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
] as const;

export type TimelineStatus = (typeof TIMELINE_STATUSES)[number];

/**
 * Customer-facing labels. Each names its enum value plainly and claims nothing
 * the status does not mean — "In production" is what PROCESSING is for a shop
 * that prints nothing until it is ordered.
 */
const LABELS: Record<TimelineStatus, string> = {
  PENDING: 'Order placed',
  PAID: 'Payment confirmed',
  PROCESSING: 'In production',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
};

/** The six statuses that leave the forward path, and how to say so. */
const EXCEPTIONS: Record<string, string> = {
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
  PARTIALLY_REFUNDED: 'Partially refunded',
  DISPUTED: 'Payment disputed',
  PAYMENT_FAILED: 'Payment failed',
  MANUAL_INTERVENTION_REQUIRED: 'Needs attention',
};

export type StepState = 'done' | 'current' | 'upcoming';

export interface TimelineStep {
  status: TimelineStatus;
  label: string;
  state: StepState;
  /** Only set where the schema genuinely records the moment. Never inferred. */
  at: Date | null;
}

export interface OrderProgress {
  steps: TimelineStep[];
  /** True when the order has left the forward path. */
  isException: boolean;
  /** The human label for the current status, exception or not. */
  currentLabel: string;
  /** How far along the path the order got, 0–1, for the progress line. */
  progress: number;
}

/**
 * Build the timeline for one order.
 *
 * @param status     The order's `status` column.
 * @param createdAt  The order's `createdAt` — the only date the first step has.
 * @param updatedAt  The order's `updatedAt` — belongs to the CURRENT step only,
 *                   because it records the most recent change and nothing else.
 */
export function getOrderProgress(
  status: string,
  createdAt: Date | string,
  updatedAt: Date | string,
): OrderProgress {
  const created = new Date(createdAt);
  const updated = new Date(updatedAt);

  const isException = status in EXCEPTIONS;

  /**
   * How far the order reached before it either stopped or left the path.
   *
   * An exception carries no information about which step it left FROM — a
   * REFUNDED order could have been refunded before printing or after delivery,
   * and the schema does not say. PAID is the only thing every exception except
   * PAYMENT_FAILED is known to have passed, so exceptions show the first step
   * complete and the rest untouched rather than guessing a position.
   */
  const reachedIndex = isException
    ? status === 'PAYMENT_FAILED'
      ? 0
      : 1
    : TIMELINE_STATUSES.indexOf(status as TimelineStatus);

  const idx = reachedIndex < 0 ? 0 : reachedIndex;

  const steps: TimelineStep[] = TIMELINE_STATUSES.map((s, i) => {
    const state: StepState = isException
      ? i <= idx
        ? 'done'
        : 'upcoming'
      : i < idx
        ? 'done'
        : i === idx
          ? 'current'
          : 'upcoming';

    return {
      status: s,
      label: LABELS[s],
      state,
      // createdAt is the placing of the order, always true for step one.
      // updatedAt is the last status change, so it is true for the current
      // step and for no other. Everything else genuinely has no timestamp.
      at: i === 0 ? created : state === 'current' && !isException ? updated : null,
    };
  });

  return {
    steps,
    isException,
    currentLabel: isException ? EXCEPTIONS[status] : (LABELS[status as TimelineStatus] ?? status),
    progress: TIMELINE_STATUSES.length > 1 ? idx / (TIMELINE_STATUSES.length - 1) : 0,
  };
}

/**
 * The label for any status, for badges and lists.
 */
export function statusLabel(status: string): string {
  return EXCEPTIONS[status] ?? LABELS[status as TimelineStatus] ?? status;
}

/**
 * Badge tone. Three tones only — the site has one accent and one ink, and
 * status is never communicated by colour alone (every badge prints its label),
 * so a palette of six status colours would add noise without adding meaning.
 */
export function statusTone(status: string): 'accent' | 'muted' | 'warn' {
  if (status === 'DELIVERED' || status === 'SHIPPED' || status === 'PAID') return 'accent';
  if (status in EXCEPTIONS) return 'warn';
  return 'muted';
}

/**
 * `shippingAddress` is a single string written by the Stripe webhook as
 * `"name | email | address"` (see `api/webhooks/stripe/route.ts`). Splitting it
 * back out is presentation, not invention — and a row that does not match the
 * shape returns what it has rather than guessing at parts it does not contain.
 */
export function parseShippingAddress(raw: string | null): {
  name: string | null;
  email: string | null;
  address: string | null;
} {
  if (!raw) return { name: null, email: null, address: null };
  const parts = raw.split('|').map((p) => p.trim());
  if (parts.length < 3) return { name: null, email: null, address: raw.trim() || null };
  return {
    name: parts[0] || null,
    email: parts[1] || null,
    address: parts.slice(2).join(' | ') || null,
  };
}
