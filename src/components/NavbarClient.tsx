"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Menu, User, Heart, X, ArrowRight } from 'lucide-react';
import BrandMark from './BrandMark';
import CartDrawer from './CartDrawer';
import SearchModal from './SearchModal';
import { signOutAction } from '@/app/auth/auth-actions';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useHomepageMode } from '@/store/useHomepageMode';
import { HOMEPAGE_CONTENT, getHomepageContent, sharedHomepage, type HomepageMode, type HomepageUser } from '@/data/homepage';

/** The two storefront modes the segmented control switches between. */
const STORES: { key: HomepageMode; label: string }[] = [
  { key: 'adult', label: HOMEPAGE_CONTENT.adult.label },
  { key: 'kids', label: HOMEPAGE_CONTENT.kids.label },
];

/**
 * Adult / Kids store switch — a global storefront mode control, not a menu or a
 * filter. Selecting a mode re-renders the catalogue for that audience.
 *
 * Only the active indicator animates, and only via `transform`, so switching
 * never triggers layout or paint on the segments themselves. The container is a
 * fixed width (or full width in the drawer) with two `1fr` columns: that keeps
 * each segment exactly 50% − 4px wide, which is both what the indicator is sized
 * to and what `translateX(100%)` moves it by — so the pill lands precisely on the
 * second segment, and the 500 → 600 weight change on the label can't nudge the
 * columns and desync it.
 */
function StoreToggle({
  mode,
  onSwitch,
  className = '',
}: {
  mode: HomepageMode;
  onSwitch: (next: HomepageMode) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Shop the Adult or Kids store"
      className={`relative grid h-10 grid-cols-2 rounded-full border border-[rgb(var(--accent-shade-rgb)/0.08)] bg-[#F4F2ED] p-1 ${className}`}
    >
      <span
        aria-hidden
        style={{ transform: mode === 'kids' ? 'translateX(100%)' : 'translateX(0)' }}
        className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-accent transition-transform duration-[220ms] ease-in-out motion-reduce:transition-none"
      />
      {STORES.map((store) => {
        const active = mode === store.key;
        return (
          <button
            key={store.key}
            type="button"
            onClick={() => onSwitch(store.key)}
            aria-pressed={active}
            className={`relative z-10 rounded-full text-[13px] tracking-[0.01em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-1 ${
              active ? 'font-semibold text-accent-on' : 'font-medium text-[#4A5568]'
            }`}
          >
            {store.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * A collection as the drawer menu lists it. `title` is what `Navbar` sends;
 * `name` is the raw Prisma column, kept as a fallback for any caller that
 * passes collections through unformatted.
 */
interface NavCollection {
  id: string;
  handle: string;
  title?: string | null;
  name?: string | null;
}

interface NavbarClientProps {
  adultCollections?: NavCollection[];
  kidsCollections?: NavCollection[];
  user?: HomepageUser | null;
}

const NavbarClient = ({ adultCollections = [], kidsCollections = [], user }: NavbarClientProps) => {
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);
  const clearCart = useCartStore((state) => state.clearCart);

  const wishlistItems = useWishlistStore((state) => state.items);
  const wishlistCount = wishlistItems.length;

  // States
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Storefront mode ──────────────────────────────────────────────────────
  // The persisted selection of Adult vs Kids. Switching it is a departure —
  // see `switchStore` — but the value itself is what every dynamic section on
  // the homepage renders from, and it survives refreshes and return visits.
  const { mode, setMode } = useHomepageMode();

  /*
   * Set for the duration of a deliberate storefront switch — see `switchStore`.
   *
   * Without it the switch undoes itself. Leaving `/collections/x?audience=adult`
   * for the Kids homepage is an async client transition, and until it lands this
   * component keeps re-rendering with the OLD url still in `searchParams`. The
   * adoption effect below would read `audience=adult` off that stale url and
   * immediately `setMode('adult')` again — the toggle snaps back and the shopper
   * arrives on the homepage in the storefront they just left. This is exactly
   * the state/route race the brief warns about.
   */
  const switchingRef = useRef(false);

  // Collection routes filter server-side on an `audience` query param, so while
  // we're on one the URL wins: the toggle can never show a mode the page isn't
  // actually rendering. Everywhere else the persisted selection decides.
  const audienceParam = searchParams.get('audience')?.toLowerCase();
  const urlMode: HomepageMode | null =
    audienceParam === 'kids' ? 'kids' : audienceParam === 'adult' ? 'adult' : null;

  // Mid-switch this url is the one being LEFT, so for the length of the
  // transition the toggle still shows the storefront being departed. That is
  // deliberate rather than unhandled: preferring the store here would mean
  // reading `switchingRef` during render, and a ref is not reactive — React
  // cannot re-render on it, and `react-hooks/refs` rejects it outright. Holding
  // it in state instead would need clearing from an effect, which is its own
  // lint violation and a worse bug if the clear is ever missed (the url would
  // stop driving the toggle for the rest of the session). The lag is a few
  // hundred milliseconds of a page transition and corrects itself on arrival;
  // the reversion the guard below prevents was permanent.
  const storeMode: HomepageMode = urlMode ?? mode;

  // Arriving on an audience-scoped URL (a shared link, say) adopts that mode
  // globally, so the rest of the site follows the page the visitor landed on.
  useEffect(() => {
    // No `audience` in the url means either an ordinary page or the homepage we
    // were heading for, so any switch in flight has completed. Nothing left to
    // suppress, and the guard clears itself rather than needing a timer.
    if (!urlMode) {
      switchingRef.current = false;
      return;
    }
    if (switchingRef.current) return;
    setMode(urlMode);
  }, [urlMode, setMode]);

  // The reverse case: a collection route with no `?audience=` renders every
  // audience, so the toggle would read "Adult" beside a grid full of kids tees.
  // Adopt the persisted mode into the URL instead, so what the toggle claims and
  // what the server filtered on can never disagree.
  useEffect(() => {
    if (urlMode || !pathname?.startsWith('/collections')) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('audience', mode);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [urlMode, pathname, searchParams, mode, router]);

  /*
   * ── SWITCHING STOREFRONT IS A DEPARTURE, NOT A FILTER ─────────────────────
   * This used to change state in place and, on a collection route, rewrite the
   * `audience` param — so a shopper reading an Adult product page who pressed
   * Kids stayed on that Adult product, and a Kids collection became the Adult
   * cut of the same collection. Adult and Kids are two shops; asking for the
   * other one is not a filter on the page you are reading.
   *
   * So every switch now lands on the storefront's home page. There is exactly
   * one such route — `/` renders whichever mode the store holds, and no
   * `/adult` or `/kids` index exists — so the destination is `/` and the mode
   * decides what it renders. No new route is invented, and the URL rewriting
   * this used to do is gone: `/` never carries an `audience` param.
   *
   * Already on `/`? Then no navigation. `/` in Kids mode IS the Kids home page,
   * and pushing the url we are already on would only add a history entry and
   * cut short the crossfade the homepage plays between the two storefronts.
   *
   * Both toggles — the desktop strip and the mobile drawer — call this, so
   * there is one switching path for the whole site.
   */
  const switchStore = (next: HomepageMode) => {
    if (next === storeMode) return;

    switchingRef.current = true;
    setMode(next);

    // The drawer used to stay open on purpose, because the menu behind it
    // re-labelled in place and closing it would have hidden the change. Now the
    // switch navigates, so an open drawer would just cover the page it sent the
    // shopper to.
    setIsMobileMenuOpen(false);

    if (pathname !== '/') router.push('/');
  };

  // Stripe Success Detector
  useEffect(() => {
    if (searchParams.get('success')) {
      clearCart();
      router.replace('/', { scroll: false });
    }
  }, [searchParams, clearCart, router]);

  // ── Scroll state ─────────────────────────────────────────────────────────
  // A single boolean: at the very top the strip is flat, and the moment the page
  // moves it lifts on a soft shadow. Only `box-shadow` transitions, so there is
  // nothing for the compositor to lay out. The listener is passive and the state
  // only flips when the threshold is actually crossed, so scrolling doesn't
  // re-render the navbar on every event (the old version did, every frame).
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 4;
      setIsScrolled((prev) => (prev === scrolled ? prev : scrolled));
    };

    handleScroll(); // honour a restored scroll position on mount
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Navigation, scoped to the selected store ─────────────────────────────
  // Labels come from the mode's data file (Adult → Men / Women / Kids,
  // Kids → Boys / Girls / Toddler / Baby), so re-labelling or re-routing the
  // menu later is a data edit, not a component change.
  const activeContent = getHomepageContent(storeMode);
  const activeCollections = storeMode === 'kids' ? kidsCollections : adultCollections;

  return (
    <>
      {/* Full-width strip, sticky at the top of the document.
          `sticky` rather than `fixed` on purpose: it keeps the navbar in normal
          flow, so it reserves its own height and page content can never slide
          underneath it — no padding offset to maintain on the layout.
          z-[70] clears the homepage promo bar (sticky, z-[60]) so the navbar
          always stays above page content. */}
      <nav
        className={`sticky top-0 z-[70] w-full border-b border-black/[0.04] bg-[#FCFCFA] transition-shadow duration-[220ms] ease-in-out ${
          isScrolled ? 'shadow-[0_6px_20px_rgba(0,0,0,0.06)]' : 'shadow-none'
        }`}
      >
        {/* Inner rail matches the page grid (max-w-[1440px], px-6 / md:px-12),
            so the logo lines up with every section below it. The strip is a
            little taller than it was and the gap after the logo a little wider:
            the mark now sits in its own space rather than being one item in an
            evenly-spaced row, which is what gives the branding its weight. */}
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center gap-5 px-6 md:h-20 md:gap-9 md:px-12">
          {/* LOGO — the shared brand mark, identical here, in the mobile drawer
              and in the footer. See BrandMark for swapping in the logo asset.
              `storeMode`, not the persisted mode, so on an `?audience=`-scoped
              collection route the mark shows the storefront the page is actually
              rendering — the same rule the toggle beside it follows.

              Both storefronts hover identically: a 2% scale, and nothing
              else. Adult used to also paint an accent-800 plate behind the mark
              and flip it to white, which Kids could not do — half the Kids
              lockup is ink black and would have vanished on that ground. The
              result was one logo that grew a dark box under the pointer and one
              that did not, on the same navbar. The plate is gone rather than
              added to Kids: a wordmark is not a button, and the lift alone is
              enough to say the target is live.

              `px-3 py-2 -ml-3` stays. It has no appearance now that the
              background is gone, but it is the hit area, and the negative
              margin is what keeps the mark optically flush with the page grid. */}
          <Link
            href="/"
            aria-label="UNRWLY — home"
            className="group flex shrink-0 items-center -ml-3 rounded-modal px-3 py-2 text-ink transition-transform duration-200 ease-out hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100"
          >
            <BrandMark size="sm" mode={storeMode} />
          </Link>

          {/* ADULT / KIDS STORE SWITCH — sits immediately right of the logo */}
          <StoreToggle mode={storeMode} onSwitch={switchStore} className="hidden w-[168px] shrink-0 md:grid" />

          {/* ABOUT — the one text link in the strip.
              It earns the slot because it is the page that answers "who am I
              buying this from?", and that question is this shop's strongest
              sales argument. Kept to `lg` and up so it never squeezes the search
              field on a tablet; below that it lives in the drawer, where it is
              the first entry rather than a footnote. Nothing was removed to make
              room — the toggle, search, account, wishlist and bag are untouched.

              The label reads "About" rather than "Meet Unrwly" — the shorter,
              conventional word people scan a header for. The destination is
              unchanged: still /meet-unrwly, still the same page. */}
          <Link
            href="/meet-unrwly"
            className={`type-nav hidden shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-[13px] uppercase tracking-[0.1em] transition-colors duration-200 ease-out hover:bg-accent-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 lg:inline-flex ${
              // Current page = the hover treatment, held. It was a bare
              // `text-accent-800` tint, so hovering About while ON About made
              // the pill visibly change — the page you are on should not look
              // like something you have yet to reach. Same classes as `hover:`
              // above, deliberately, so the two can never drift apart.
              pathname === '/meet-unrwly' ? 'bg-accent-800 text-white' : 'text-accent-950'
            }`}
            aria-current={pathname === '/meet-unrwly' ? 'page' : undefined}
          >
            About
          </Link>

          {/* INLINE SEARCH BAR — the anchor of the strip, taking all remaining space */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
              if (input.trim()) router.push(`/collections?q=${encodeURIComponent(input.trim())}`);
            }}
            className="group/search hidden h-10 min-w-0 flex-1 items-center rounded-full border border-[rgb(var(--accent-shade-rgb)/0.10)] md:max-w-[300px] lg:max-w-[380px] bg-white transition-[border-color,box-shadow] duration-200 ease-out hover:border-[rgb(var(--accent-shade-rgb)/0.18)] focus-within:border-accent-800 focus-within:ring-2 focus-within:ring-accent-800/10 md:flex"
          >
            <div className="pl-4 text-[#8a93a6] transition-colors duration-200 group-focus-within/search:text-accent-800">
              <Search size={18} strokeWidth={1.8} />
            </div>
            <input
              name="q"
              type="text"
              placeholder="Search for products..."
              className="flex-1 h-full px-3 text-sm bg-transparent focus:outline-none text-accent-950 placeholder:text-[#8a93a6] placeholder:font-medium placeholder:tracking-wide"
            />
            <button
              type="submit"
              aria-label="Search"
              className="mr-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#8a93a6] transition-all duration-200 ease-out hover:bg-accent-800 hover:text-white group-focus-within/search:bg-accent-800 group-focus-within/search:text-white"
            >
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          </form>

          {/* ICONS ROW — Account / Wishlist / Cart, untouched behaviour.
              gap-0.5 (2px) between 40px hit targets holding 18px glyphs lands the
              optical spacing between icons at 24px, the top of the 20–24px range,
              without shrinking the tap targets. */}
          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            {/* Profile */}
            <button
              onClick={() => user ? router.push(isAdmin ? '/admin/products' : '/account') : router.push('/auth')}
              aria-label={user ? 'Account' : 'Sign in'}
              className="group hidden sm:flex h-10 min-w-10 items-center justify-center gap-2 rounded-full px-2.5 transition-all duration-200 ease-out hover:bg-accent-800 hover:scale-[1.02] lg:px-3"
            >
              <User size={18} strokeWidth={1.8} className="shrink-0 text-accent-950 transition-colors duration-200 group-hover:text-white" />
              <span
                aria-hidden
                className="type-nav hidden whitespace-nowrap text-[13px] uppercase tracking-[0.1em] text-accent-950 transition-colors duration-200 group-hover:text-white lg:inline"
              >
                {user ? 'Account' : 'Sign in'}
              </span>
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" aria-label="Wishlist" className="group hidden sm:flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ease-out hover:bg-accent-800 hover:scale-[1.02]">
              <span className="relative">
                <Heart
                  size={18}
                  strokeWidth={1.8}
                  fill={wishlistCount > 0 ? "currentColor" : "none"}
                  className={`transition-colors duration-200 ${wishlistCount > 0 ? 'text-accent-700' : 'text-accent-950'} group-hover:text-white`}
                />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-700 text-[8px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </span>
            </Link>

            {/* Bag */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Bag"
              className="group flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ease-out hover:bg-accent-800 hover:scale-[1.02]"
            >
              <span className="relative">
                <ShoppingBag size={18} strokeWidth={1.8} className="text-accent-950 transition-colors duration-200 group-hover:text-white" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-700 text-[8px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </span>
            </button>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex h-11 w-11 items-center justify-center rounded-modal text-accent-950 transition-all duration-200 ease-out hover:bg-accent-800 hover:text-white hover:scale-[1.02]"
            >
              <Menu size={24} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE OVERLAY MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] bg-[#FCFCFA] flex flex-col p-6 lg:hidden"
          >
            <div className="flex justify-between items-center h-20 mb-12">
              <Link
                href="/"
                aria-label="UNRWLY — home"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center text-ink"
              >
                <BrandMark size="md" mode={storeMode} />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-[rgb(var(--accent-shade-rgb)/0.08)] shadow-[0_6px_18px_rgb(var(--accent-shade-rgb)/0.08)] text-accent-950"
              >
                <X size={24} strokeWidth={1.8} />
              </button>
            </div>

            <div className="flex flex-col gap-8 overflow-y-auto pb-12">
              {/* Store switch — same control and same handler as the desktop
                  strip, full width. It now closes the drawer and leaves for the
                  other storefront's home page, so the shopper sees where they
                  landed instead of the menu they pressed it in. */}
              <StoreToggle mode={storeMode} onSwitch={switchStore} className="w-full" />

              {/* About — first, above the shop navigation. On a phone the
                  drawer IS the navigation, so the page that introduces the brand
                  should not be buried under four category links. Same label as
                  the desktop strip, same destination as before. */}
              <Link
                href="/meet-unrwly"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-current={pathname === '/meet-unrwly' ? 'page' : undefined}
                // Same rule as the desktop strip: on About, hold this link's own
                // hover colour. It had no current-page state at all, so the
                // drawer gave no clue which page you were on.
                className={`type-nav text-3xl uppercase transition-all hover:text-accent-800 ${
                  pathname === '/meet-unrwly' ? 'text-accent-800' : 'text-ink'
                }`}
              >
                About
              </Link>

              {/* Primary navigation — follows the selected store */}
              <div className="flex flex-col gap-4">
                <span className="type-label text-slate-400">{activeContent.label}</span>
                {activeContent.nav.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="type-nav text-3xl uppercase text-ink transition-all hover:text-accent-800"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* The selected store's collections */}
              {activeCollections.length > 0 && (
                <div className="flex flex-col gap-4">
                  <span className="type-label text-slate-400">{sharedHomepage.collectionsMenuLabel}</span>
                  {activeCollections.map((col) => (
                    <Link
                      key={col.id}
                      href={`/collections/${col.handle}?audience=${storeMode}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="type-nav text-3xl uppercase text-ink transition-all hover:text-accent-800"
                    >
                      {col.title || col.name}
                    </Link>
                  ))}
                </div>
              )}
              <Link
                href={`/collections/all?audience=${storeMode}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="type-nav text-3xl uppercase text-ink transition-all hover:text-accent-800"
              >
                New Drops
              </Link>
            </div>

            <div className="mt-auto pt-8 border-t border-[rgb(var(--accent-shade-rgb)/0.08)] grid grid-cols-2 gap-4">
              <Link
                href={user ? (isAdmin ? '/admin/products' : '/account') : '/auth'}
                onClick={() => setIsMobileMenuOpen(false)}
                className="type-button flex items-center justify-center h-14 bg-white border border-[rgb(var(--accent-shade-rgb)/0.08)] rounded-2xl text-[11px] uppercase tracking-widest text-accent-950 shadow-[0_6px_18px_rgb(var(--accent-shade-rgb)/0.06)] transition-all hover:bg-accent-800 hover:text-white"
              >
                {user ? 'Profile' : 'Login'}
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="type-button flex items-center justify-center h-14 bg-white border border-[rgb(var(--accent-shade-rgb)/0.08)] rounded-2xl text-[11px] uppercase tracking-widest text-accent-950 shadow-[0_6px_18px_rgb(var(--accent-shade-rgb)/0.06)] transition-all hover:bg-accent-800 hover:text-white"
              >
                Wishlist ({wishlistCount})
              </Link>
              {user && (
                <button
                  onClick={async () => {
                    await signOutAction();
                    setIsMobileMenuOpen(false);
                  }}
                  className="type-button col-span-2 h-12 text-[10px] uppercase tracking-widest text-brand-terracotta"
                >
                  Terminate Session
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer />
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
};

export default NavbarClient;
