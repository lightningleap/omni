import { statusLabel, statusTone } from '@/lib/orderStatus';

/**
 * An order status, as a compact pill.
 *
 * Three tones, not eleven. The site has one accent and one ink, and every badge
 * prints its own label, so status never depends on colour to be understood —
 * which means a palette of eleven status colours would add noise and no
 * meaning. `accent` is the order moving as it should, `warn` is an order that
 * has left that path, `muted` is one that has not started moving yet.
 *
 * The "warn" tone is the project's existing terracotta, not a new red.
 */
export default function StatusBadge({ status }: { status: string }) {
  const tone = statusTone(status);

  const chrome =
    tone === 'accent'
      ? 'border-accent-200 bg-accent-50 text-accent-700'
      : tone === 'warn'
        ? 'border-[#E7D3CB] bg-[#FBF3F0] text-brand-terracotta'
        : 'border-[#EAE6DF] bg-[#F7F6F3] text-neutral-500';

  return (
    <span
      className={`inline-flex items-center rounded-pill border px-2.5 py-1 text-[11px] font-semibold leading-none ${chrome}`}
    >
      {statusLabel(status)}
    </span>
  );
}
