"use client";

import BrandMark from '@/components/BrandMark';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Package,
  Tags,
  Users,
  Megaphone,
  BarChart,
  DollarSign,
  LogOut,
  TrendingUp,
  Image as ImageIcon,
  FolderTree,
  Menu,
  X,
} from 'lucide-react';
import { signOutAction } from '@/app/auth/auth-actions';

/** Navigation. Unchanged — same labels, same destinations, same order. */
const menuItems = [
  { icon: Home, label: 'Home', href: '/admin' },
  { icon: Package, label: 'Orders', href: '/admin/orders' },
  { icon: Tags, label: 'Products', href: '/admin/products' },
  { icon: FolderTree, label: 'Collections', href: '/admin/products/collections' },
  { icon: Users, label: 'Customers', href: '/admin/customers' },
  { icon: ImageIcon, label: 'Content', href: '/admin/content' },
  { icon: DollarSign, label: 'Finance', href: '/admin/finance' },
  { icon: BarChart, label: 'Analytics', href: '/admin/analytics' },
  { icon: Megaphone, label: 'Marketing', href: '/admin/marketing' },
];

/**
 * The Management Studio's navigation.
 *
 * ── WHAT WAS BROKEN ─────────────────────────────────────────────────────────
 * The sidebar was `fixed w-64` at every breakpoint and the layout applied a
 * matching `ml-64` unconditionally. On a phone that meant a 256px panel pinned
 * over the content AND the content pushed 256px right — the admin was
 * unusable below about 900px, and the page scrolled sideways. It now collapses
 * to a drawer under `lg`, with a top bar carrying the mark and the toggle.
 *
 * ── THE GROUND ─────────────────────────────────────────────────────────────
 * `accent-600` — #509176, one step down the sage ramp from the Adult logo
 * green (`accent-900`, #75AC95). Taken from the token, never hard-coded, so
 * the studio cannot drift from the palette.
 *
 * The logo green itself was tried and was too light to carry the off-white
 * labels. The step below it, `accent-500`, is only 4% darker by luminance —
 * an invisible change. `accent-600` is 34% darker: clearly the same green,
 * plainly not the dark `accent-800` that reads as near-black.
 *
 * ── THE TEXT IS OFF-WHITE, AND WHAT THAT COSTS ──────────────────────────────
 * Inactive labels are #F4F2ED on this green, which measures 3.32:1. That is
 * under the 4.5:1 AA floor for body text, and it is a deliberate, sighted
 * decision: dark labels passed at 5.70:1 but read as muddy against the
 * mid-tone, and the light-on-colour rail is the look this studio is going for.
 *
 * The measurement is recorded here so nobody has to rediscover it. Note that
 * off-white is not a compromise between white and dark — it is slightly WORSE
 * than pure white here (2.32 against 2.60), because on a light-ish ground
 * contrast rises with the foreground's distance from it, and white is as far
 * as a light foreground can get.
 *
 * If this ever needs to pass AA without losing the light-on-green look, the
 * fix is one more step: `accent-700` (#3E715C) takes the same off-white to
 * 5.04:1, and `accent-800` to 7.39:1. Both stay in this sage ramp.
 *
 * Weight does some of the work opacity cannot: labels are `font-medium` and
 * the active one `font-semibold`, so the selected entry is heavier as well as
 * inverted.
 *
 * ── THE ACTIVE ITEM CONNECTS TO THE PAGE ────────────────────────────────────
 * It is painted in #F4F2ED — the main content ground, not white — and it
 * bleeds through the rail's right edge with `-mr-3` and no right radius. The
 * plate and the page behind it are therefore the same colour meeting with no
 * seam, so the selected entry reads as an opening into the screen it leads to
 * rather than a highlight sitting beside it. A white plate would have been a
 * shade off the page and shown a visible join.
 *
 * Items are sentence case at 13px. They were 11px bold uppercase with 0.15em
 * tracking, which at nine entries turned the column into a wall of caps.
 */
// `user` is accepted because the layout passes it, and ignored because this
// component does not render anything from it. Destructured and voided rather
// than named, so the signature stays honest without tripping no-unused-vars.
export default function AdminSidebar({}: { user?: unknown }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  /**
   * Closing the drawer is a CLICK HANDLER, not an effect on `pathname`.
   *
   * Reacting to the path meant setting state synchronously inside an effect on
   * every navigation — a cascading render that React's own lint rule flags,
   * to undo something the click already knew about. The link closes it
   * directly. On the desktop rail `open` is already false, and React bails out
   * of a set to the same value, so sharing one handler costs nothing.
   */
  const close = () => setOpen(false);

  const nav = (
    <>
      {/* Brand */}
      <div className="px-5 pb-5 pt-6">
        {/* The real mark, not a text approximation. `mode="adult"` is explicit
            and load-bearing: BrandMark follows the active storefront by
            default, which would swap the admin logo to the Kids lockup purely
            because whoever is signed in last browsed the Kids store. The back
            office has one identity — the same reason `[data-admin-surface]`
            pins the Adult accent in globals.css.

            It renders `role="img"` with `aria-label="UNRWLY"`, so the heading
            keeps an accessible name without a separate text node. */}
        {/* The mark is a mask filled with `currentColor`, so this off-white is
            what paints it — the same tone as the labels below, so the brand
            block and the navigation read as one light column. */}
        <h1 className="text-[#F4F2ED]">
          <BrandMark size="md" mode="adult" tone="inherit" />
        </h1>
        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F4F2ED]/85">
          Management Studio
        </p>
      </div>

      {/* Navigation */}
      <nav aria-label="Management Studio" className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-2 pb-2 pt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[#F4F2ED]/75">
          Management
        </p>
        <ul className="space-y-0.5">
          {menuItems.map((item) => {
            // `/admin` must match exactly or it would light up on every child
            // route; the rest match their own subtree.
            const active =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex items-center gap-3 py-2.5 pl-3 text-[13px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                    active
                      ? // -mr-3 cancels the nav's right padding so the plate runs
                        // through the rail's edge and meets the page ground with
                        // no seam. Left corners only, for the same reason.
                        '-mr-3 rounded-l-panel bg-[#F4F2ED] pr-3 font-semibold text-accent-800'
                      : 'rounded-l-panel pr-3 font-medium text-[#F4F2ED] hover:bg-white/20'
                  }`}
                >
                  <item.icon
                    aria-hidden
                    size={16}
                    strokeWidth={1.75}
                    className={active ? 'text-accent-800' : 'text-[#F4F2ED]/85'}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom actions — same two, same behaviour */}
      <div className="border-t border-white/25 px-3 py-3">
        <Link
          href="/"
          onClick={close}
          className="flex items-center gap-3 rounded-panel px-3 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition-colors duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <TrendingUp aria-hidden size={16} strokeWidth={1.75} className="text-[#F4F2ED]/85" />
          View Store
        </Link>
        <button
          type="button"
          onClick={() => signOutAction()}
          className="flex w-full items-center gap-3 rounded-panel px-3 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition-colors duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <LogOut aria-hidden size={16} strokeWidth={1.75} className="text-[#F4F2ED]/85" />
          Log Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── MOBILE TOP BAR ─────────────────────────────────────────────── */}
      <div
        className="fixed inset-x-0 top-0 z-[60] flex h-14 items-center gap-3 bg-accent-600 px-4 lg:hidden"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-card text-[#F4F2ED] transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <Menu aria-hidden size={18} strokeWidth={1.75} />
        </button>
        {/* tone="inherit" — the mark is a mask filled with currentColor, so
            this colour is what paints it. Left on the default accent tone it
            would render the logo green on the logo green and disappear. */}
        <span className="text-[#F4F2ED]">
          <BrandMark size="sm" mode="adult" tone="inherit" />
        </span>
      </div>

      {/* ── MOBILE DRAWER ──────────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside
            className="relative flex h-full w-[260px] flex-col bg-accent-600"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-card text-[#F4F2ED] transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <X aria-hidden size={16} strokeWidth={2} />
            </button>
            {nav}
          </aside>
        </div>
      )}

      {/* ── DESKTOP RAIL ───────────────────────────────────────────────── */}
      <aside
        className="fixed left-0 top-0 z-[60] hidden h-screen w-60 flex-col bg-accent-600 lg:flex"
      >
        {nav}
      </aside>
    </>
  );
}
