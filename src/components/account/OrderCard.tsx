import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

type Order = {
  id: string;
  orderNumber?: string | null;
  status: string;
  totalAmount: number;
  createdAt: Date | string;
  items?: { id: string; quantity: number; product?: { name?: string | null; images?: unknown } | null }[];
};

/**
 * One order in the history list.
 *
 * ── THREE BANDS, ONE HAIRLINE BOX ───────────────────────────────────────────
 * Identity and status on top, the goods in the middle, the action at the
 * bottom. The old version was a table row set in bold italic uppercase at 11px,
 * which is unreadable at a glance and belongs to no other page on this site.
 *
 * The thumbnails are a stack of up to three overlapping 44px tiles with a
 * "+n" for the rest — enough to recognise the order without turning a list of
 * six orders into a wall of product photography.
 */
export default function OrderCard({ order }: { order: Order }) {
  const items = order.items ?? [];
  const unitCount = items.reduce((n, i) => n + i.quantity, 0);
  const shown = items.slice(0, 3);
  const overflow = items.length - shown.length;
  const reference = order.orderNumber ?? `#${order.id.slice(-8).toUpperCase()}`;

  return (
    <article className="rounded-panel border border-[#EAE6DF] bg-white">
      {/* ── IDENTITY ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EAE6DF] px-5 py-4">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold leading-none text-ink">{reference}</p>
          <p className="mt-2 text-[12px] text-neutral-400">
            <time dateTime={new Date(order.createdAt).toISOString()}>
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </time>
            {' · '}
            {unitCount} {unitCount === 1 ? 'item' : 'items'}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* ── GOODS ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {shown.map((item) => {
              const src = firstImage(item.product?.images);
              return (
                <span
                  key={item.id}
                  className="relative h-11 w-11 overflow-hidden rounded-card border border-white"
                  style={{ backgroundColor: '#F1F1EF' }}
                >
                  {src && (
                    <Image
                      src={src}
                      alt={item.product?.name ?? ''}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  )}
                </span>
              );
            })}
            {overflow > 0 && (
              <span className="relative flex h-11 w-11 items-center justify-center rounded-card border border-white bg-[#F1F1EF] text-[11px] font-semibold text-neutral-500">
                +{overflow}
              </span>
            )}
          </div>
        </div>

        <p className="shrink-0 text-[16px] font-bold tabular-nums text-ink">
          ${Number(order.totalAmount).toFixed(2)}
        </p>
      </div>

      {/* ── ACTION ────────────────────────────────────────────────────── */}
      <div className="border-t border-[#EAE6DF] px-5 py-4">
        <Link href={`/account/orders/${order.id}`} className="btn-commerce-secondary group h-10 min-h-0 w-full">
          Track order
          <ArrowRight
            aria-hidden
            size={14}
            strokeWidth={2}
            className="transition-transform duration-[250ms] ease-out group-hover:translate-x-1 motion-reduce:transition-none"
          />
        </Link>
      </div>
    </article>
  );
}

/** See the note on the same helper in `OrderItems` — `images` is loose Json. */
function firstImage(images: unknown): string | null {
  if (!Array.isArray(images) || images.length === 0) return null;
  const first = images[0];
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object') {
    const src = (first as Record<string, unknown>).src ?? (first as Record<string, unknown>).url;
    if (typeof src === 'string') return src;
  }
  return null;
}
