import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * Compact "← Back to Shop" link, shown above the breadcrumb on every listing page.
 *
 * The breadcrumb already exposes the parent as a link, so this is not the only
 * way back — it is the OBVIOUS one. A trail reads as orientation ("where am I");
 * a shopper leaving a collection is looking for an action ("take me back"), and
 * scanning a chevron-separated list for the second-to-last item is not that.
 *
 * Deliberately quiet: the same 11px caption step, tracking and neutral-500 the
 * breadcrumb uses, so it reads as navigation furniture rather than a call to
 * action competing with the page title under it. The arrow is 14px — the icon
 * sizes already used across the storefront's small controls — and marked
 * aria-hidden, since the link's own text already says where it goes.
 *
 * The target is data, not history: `router.back()` would send someone who deep-
 * linked into a collection back out of the site entirely, and would lie about
 * the destination when the previous page was a product or the cart. Pointing at
 * the category's own parent means the label and the behaviour always agree.
 */
export default function PlpBackLink({
  parent,
}: {
  /** The category's parent — the last entry of its breadcrumb trail. */
  parent?: { label: string; href: string };
}) {
  if (!parent) return null;

  return (
    <Link
      href={parent.href}
      className="type-caption group/back mb-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-neutral-500 transition-colors duration-200 ease-out hover:text-accent-ink focus-visible:text-accent-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2"
    >
      <ArrowLeft
        aria-hidden
        size={14}
        strokeWidth={2}
        className="transition-transform duration-200 ease-out group-hover/back:-translate-x-0.5"
      />
      Back to {parent.label}
    </Link>
  );
}
