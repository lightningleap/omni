"use client";

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { categoryHref, getPrimaryCategories } from '@/data/shopCategories';
import type { ShopAudience } from '@/types/plp';

/**
 * Department navigation — "All · Men · Women · Unisex", "All · Boys · Girls · …".
 *
 * ── WHY THIS IS TEXT AND NOT PILLS ──────────────────────────────────────────
 * The first version of this rail was a row of bordered, fully-rounded pills. It
 * was wrong for two reasons. The obvious one: the page already had pills for
 * quick filters and pills for the filter control, and a third row of them
 * turned the top of a fashion PLP into a dashboard of buttons. The real one:
 * this rail is NAVIGATION, and the site already has a way of setting
 * navigation — `.type-nav`, uppercase, wide-tracked, `text-ink`, going
 * `accent-800` on hover, used for every link in the navbar. Departments are the
 * same kind of thing as the navbar's links, so they are set the same way.
 *
 * Active state is an accent underline rather than a filled ground: a filled
 * shape reads as a control you press, and these are places you go. The
 * underline also survives the storefront swap without a second thought, since
 * it is drawn in the accent that Adult and Kids each define for themselves.
 *
 * ── WHY LINKS, NOT FILTER BUTTONS ───────────────────────────────────────────
 * Each department is a real route with its own scope, metadata and shareable
 * URL. Rendering them as filter state would collapse several indexable pages
 * into one and break back/forward. The set comes from the category registry
 * filtered to this audience, so Adult shows Adult departments and Kids shows
 * Kids ones, and neither can drift from the routes that actually exist.
 */
export default function CategoryNavigation({ audience }: { audience: ShopAudience }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categories = getPrimaryCategories(audience);

  if (categories.length === 0) return null;

  /*
   * ── TWO MODES, ONE RAIL ───────────────────────────────────────────────────
   * On a DEPARTMENT route (`/shop/men`, `/kids/3-5`) the entries are what they
   * have always been: sibling routes, each with its own title and breadcrumb.
   *
   * On a NAMED COLLECTION (`/collections/french-with-attitude`) they are a
   * FILTER. They used to be links to `/shop/men` here too, which is why picking
   * one appeared to rename the page: it did not rename anything — it navigated
   * to a different page that has its own title. The collection was left behind.
   *
   * In filter mode each entry sets `?dept=<slug>` on the CURRENT url and
   * changes nothing else. The route, and therefore the title, the breadcrumb
   * and the collection's own product set, are untouched by definition — there
   * is no code path that could substitute one for the other.
   *
   * Still <Link>s, not buttons: the selection lives in the URL, so it survives
   * refresh, back/forward and sharing, which is what the department routes gave
   * for free and what a piece of component state would have thrown away.
   */
  const isNamedCollection =
    (pathname?.startsWith('/collections/') ?? false) && pathname !== '/collections/all';

  /** Current url with `dept` set, or removed for "All". Every other param survives. */
  const deptHref = (slug?: string) => {
    const next = new URLSearchParams(searchParams?.toString() ?? '');
    if (slug) next.set('dept', slug);
    else next.delete('dept');
    const qs = next.toString();
    return `${pathname}${qs ? `?${qs}` : ''}`;
  };

  const activeDept = searchParams?.get('dept') ?? null;

  const allHref = isNamedCollection ? deptHref() : `/collections/all?audience=${audience}`;
  // In filter mode "All" is current when no department is chosen. On a department
  // route it is the `/collections/all` stop, current whenever we are on one.
  const allActive = isNamedCollection
    ? activeDept === null
    : (pathname?.startsWith('/collections') ?? false);

  const link = (active: boolean) =>
    `type-nav relative inline-block whitespace-nowrap pb-2 text-[13px] uppercase tracking-[0.1em] transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:text-accent-800 ${
      active
        ? 'text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-accent after:content-[""]'
        : 'text-neutral-500 hover:text-accent-800'
    }`;

  return (
    <nav aria-label="Categories" className="mb-6 border-b border-black/[0.06]">
      <ul className="no-scrollbar flex items-center gap-7 overflow-x-auto md:gap-9">
        <li>
          <Link href={allHref} aria-current={allActive ? 'page' : undefined} className={link(allActive)}>
            All
          </Link>
        </li>
        {categories.map((category) => {
          const href = isNamedCollection ? deptHref(category.slug) : categoryHref(category);
          const active = isNamedCollection
            ? activeDept === category.slug
            : pathname === categoryHref(category);
          return (
            <li key={category.slug}>
              <Link href={href} aria-current={active ? 'page' : undefined} className={link(active)}>
                {category.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
