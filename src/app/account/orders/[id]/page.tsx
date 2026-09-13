import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { getOrderProgress } from '@/lib/orderStatus';
import OrderStatusTimeline from '@/components/account/OrderStatusTimeline';
import OrderItems from '@/components/account/OrderItems';
import OrderAside from '@/components/account/OrderAside';
import StatusBadge from '@/components/account/StatusBadge';

export const metadata: Metadata = {
  title: 'Track order',
  robots: { index: false, follow: false },
};

/**
 * Track one order.
 *
 * ── OWNERSHIP IS ENFORCED IN THE QUERY, NOT AFTER IT ────────────────────────
 * The order is fetched with `where: { id, userId }`. An order belonging to
 * somebody else does not come back at all, so there is no window in which
 * another customer's address and items exist in this render. Fetching by id and
 * then comparing owners in the component would be one early return away from
 * leaking an order, and order ids are guessable enough to matter.
 *
 * A signed-out visitor is redirected to /auth, exactly as /account does.
 *
 * ── NOT FOUND IS A PAGE, NOT AN EXCEPTION ───────────────────────────────────
 * A missing order and an order owned by someone else are deliberately
 * indistinguishable: both render the same "Order not found" panel. Saying "this
 * order exists but is not yours" would confirm the id to anyone probing.
 */
export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { id: true },
  });

  const order = dbUser
    ? await prisma.order.findFirst({
        where: { id, userId: dbUser.id },
        include: { items: { include: { product: true } } },
      })
    : null;

  if (!order) return <NotFound />;

  const progress = getOrderProgress(order.status, order.createdAt, order.updatedAt);
  const reference = order.orderNumber ?? `#${order.id.slice(-8).toUpperCase()}`;

  return (
    <main className="mx-auto w-full max-w-[1120px] px-5 py-10 md:px-10 md:py-14">
      <Breadcrumb reference={reference} />

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="mt-6 flex flex-wrap items-start justify-between gap-4 border-b border-[#EAE6DF] pb-7">
        <div>
          <h1 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-ink md:text-[30px]">
            Order tracking
          </h1>
          <p className="mt-2 text-[13px] text-neutral-500">
            {reference}
            {' · '}
            <time dateTime={order.createdAt.toISOString()}>
              {order.createdAt.toLocaleDateString(undefined, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </time>
          </p>
        </div>
        <StatusBadge status={order.status} />
      </header>

      {/* ── TIMELINE ───────────────────────────────────────────────────── */}
      <div className="border-b border-[#EAE6DF] py-9 md:py-12">
        <OrderStatusTimeline progress={progress} />
      </div>

      {/* ── ITEMS + ASIDE ──────────────────────────────────────────────── */}
      <div className="grid gap-10 py-9 md:py-12 lg:grid-cols-12 lg:gap-14">
        <section aria-labelledby="items-heading" className="lg:col-span-7">
          <h2 id="items-heading" className="type-label mb-4 text-[11px] text-neutral-500">
            Order items
          </h2>
          <OrderItems items={order.items} />
        </section>

        <aside className="lg:col-span-5">
          <OrderAside
            totalAmount={order.totalAmount}
            totalPaid={order.totalPaid}
            refundedAmount={order.refundedAmount}
            shippingAddress={order.shippingAddress}
            trackingNumber={order.trackingNumber}
            carrier={order.carrier}
            trackingUrl={order.trackingUrl}
          />
        </aside>
      </div>

      <div className="border-t border-[#EAE6DF] pt-8">
        <Link href="/account" className="btn-commerce-secondary group">
          <ArrowLeft
            aria-hidden
            size={14}
            strokeWidth={2}
            className="transition-transform duration-[250ms] ease-out group-hover:-translate-x-1 motion-reduce:transition-none"
          />
          Back to order history
        </Link>
      </div>
    </main>
  );
}

/**
 * Home / Account / Track order.
 *
 * The project has no breadcrumb component, so this is a local `<nav>` rather
 * than a new shared abstraction built for one caller. The current page is plain
 * text with `aria-current`, not a link to itself.
 */
function Breadcrumb({ reference }: { reference: string }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-[12px] text-neutral-400">
        <li>
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
        </li>
        <ChevronRight aria-hidden size={13} strokeWidth={2} className="text-neutral-300" />
        <li>
          <Link href="/account" className="transition-colors hover:text-ink">
            Account
          </Link>
        </li>
        <ChevronRight aria-hidden size={13} strokeWidth={2} className="text-neutral-300" />
        <li aria-current="page" className="font-semibold text-neutral-500">
          {reference}
        </li>
      </ol>
    </nav>
  );
}

/**
 * The order could not be found, or is not this customer's. One panel for both —
 * see the note on the page component.
 */
function NotFound() {
  return (
    <main className="mx-auto w-full max-w-[1120px] px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[42ch] rounded-panel border border-[#EAE6DF] bg-white px-6 py-14 text-center">
        <h1 className="text-[20px] font-semibold text-ink">Order not found</h1>
        <p className="mt-3 text-[13px] leading-relaxed text-neutral-500">
          We could not find that order on your account. It may have been placed
          with a different email address.
        </p>
        <Link href="/account" className="btn-commerce mt-7">
          Back to order history
        </Link>
      </div>
    </main>
  );
}
