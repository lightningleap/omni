"use client";

import { useCallback } from 'react';
import { FUTURE_FEATURES } from '@/components/plp/future/futureFeatures';

/**
 * PLACEHOLDER — Wishlist size alerts ("tell me when my size is back").
 *
 * This is the seam, not the feature. It is a hook rather than a component
 * because the feature is data, not layout: the wishlist UI already exists, and
 * an alert is a stored intent (product + size + contact) plus a notification
 * when stock returns.
 *
 * Nothing here can work until two things exist: per-size stock on the product,
 * and a table to hold subscriptions. Until then `isEnabled` is false and the
 * wishlist renders exactly as it does today.
 *
 * To finish it:
 *   1. Add a `SizeAlert` model (userId, productId, size, createdAt, notifiedAt).
 *   2. Write `subscribe`/`unsubscribe` as server actions against it.
 *   3. On the Printify stock webhook, resolve matching alerts and send via
 *      `lib/email.ts` (Resend is already wired up).
 *   4. Enable `FUTURE_FEATURES.wishlistSizeAlerts`.
 */
export interface SizeAlert {
  productId: string;
  size: string;
}

export interface UseSizeAlertsResult {
  isEnabled: boolean;
  isSubscribed: (alert: SizeAlert) => boolean;
  subscribe: (alert: SizeAlert) => Promise<void>;
  unsubscribe: (alert: SizeAlert) => Promise<void>;
}

export function useSizeAlerts(): UseSizeAlertsResult {
  const notReady = useCallback(async () => {
    // Intentionally inert. Wired for shape only — see the file header.
  }, []);

  return {
    isEnabled: FUTURE_FEATURES.wishlistSizeAlerts,
    isSubscribed: () => false,
    subscribe: notReady,
    unsubscribe: notReady,
  };
}
