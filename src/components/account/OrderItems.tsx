import Image from 'next/image';
import Link from 'next/link';

type Item = {
  id: string;
  quantity: number;
  price: number;
  variantId?: string | null;
  product?: { name?: string | null; slug?: string | null; images?: unknown } | null;
};

/**
 * The line items of one order.
 *
 * Rows divided by hairlines rather than boxed as cards: an order is a list, and
 * five bordered panels stacked vertically read as five unrelated things. The
 * thumbnail is 64px — large enough to recognise the garment, small enough that
 * a four-item order does not become a scroll.
 *
 * Everything here is the order's own stored data. `price` is the line price
 * RECORDED AT PURCHASE on `OrderItem`, never the product's current price, so a
 * later price change cannot rewrite what someone paid.
 */
export default function OrderItems({ items }: { items: Item[] }) {
  return (
    <ul className="divide-y divide-[#EAE6DF] border-y border-[#EAE6DF]">
      {items.map((item) => {
        const name = item.product?.name ?? 'Item no longer available';
        const slug = item.product?.slug ?? null;
        const image = firstImage(item.product?.images);

        return (
          <li key={item.id} className="flex items-center gap-4 py-4">
            <div
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-card"
              style={{ backgroundColor: '#F1F1EF' }}
            >
              {image && (
                <Image
                  src={image}
                  alt={name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              {slug ? (
                <Link
                  href={`/products/${slug}`}
                  className="text-[14px] font-semibold leading-snug text-ink hover:text-accent-ink focus-visible:outline-none focus-visible:underline"
                >
                  {name}
                </Link>
              ) : (
                <p className="text-[14px] font-semibold leading-snug text-ink">{name}</p>
              )}
              <p className="mt-1 text-[12px] text-neutral-400">Qty {item.quantity}</p>
            </div>

            <p className="shrink-0 text-[14px] font-semibold tabular-nums text-ink">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The first usable image URL on a product.
 *
 * `Product.images` is Prisma `Json`, so it can be an array of strings, an array
 * of objects, or null depending on which sync wrote it. This returns null
 * rather than throwing on any shape it does not recognise — a missing thumbnail
 * is a grey square, never a crashed order page.
 */
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
