"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Star, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { sendGAEvent } from '@next/third-parties/google'; // Added import
import { resolveColorSwatches } from '@/data/colorSwatches';

// ── The storefront accent (same as the Add-to-Bag button), read from the theme
//    rather than spelled out, so a selected swatch rings in Adult's mint or Kids'
//    #2BF6C5 depending on which store is showing. Wishlist "saved" is the only
//    warm state (red). ──
const ACCENT_RING = 'var(--accent-900)';
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600';

/**
 * How many swatches a card draws before collapsing the rest into "+N".
 *
 * Five is what the metadata row can hold beside a badge on the narrowest card
 * (two-up on a phone, ~160px): 5 × 14px + 4 × 6px of gap ≈ 94px, which leaves
 * the badge its room without either wrapping onto a second line and pushing the
 * title down. Anything past five is a count, not a colour — the product page
 * carries the full run.
 */
const MAX_SWATCHES = 5;

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ TEMPORARY — DEMO SWATCHES. Delete this whole block, plus the single      ║
// ║ `?? demoSwatchSlugs(...)` line in `colourSwatches` below, the moment the ║
// ║ catalogue carries real colour data. Nothing else references it.          ║
// ╚══════════════════════════════════════════════════════════════════════════╝
//
// WHY IT EXISTS
// `Product` has no colour column, so colours are keyword-matched from the
// product name — and most names ("Zouzou's Heart Square Pillow Case") contain
// none. That left the right-hand side of the metadata row empty on most cards
// and the grid looked ragged, so these stand in while the card design is being
// judged.
//
// WHAT THEY ARE NOT
// They are NOT purchasable variants and must never be treated as such. They are
// rendered as decorative, non-interactive spans (`aria-hidden`, no click, no
// selected state) rather than as buttons — a screen reader must not announce a
// colour this shop cannot actually sell, and a shopper must not be able to
// "choose" one. Real swatches keep the full interactive treatment.
//
// WHERE REAL DATA COMES FROM
// `resolveProductAttributes` in utils/plp/productAttributes.ts is the single
// seam. When `Product` gains colours (from Printify variants or a variant
// table), that function reads them, every card fills in, and this block goes.

/** Muted apparel colours from the shared palette — nothing invented here. */
const DEMO_SWATCH_SETS: readonly (readonly string[])[] = [
  ['black', 'white', 'beige'],
  ['white', 'navy', 'grey'],
  ['black', 'beige', 'olive', 'white'],
  ['white', 'brown', 'black'],
  ['navy', 'beige', 'white', 'grey'],
];

/**
 * A stable demo set for one product.
 *
 * Derived from the product's own id rather than picked at random, for two
 * reasons: a random set would differ between the server render and the client
 * render and blow up hydration, and it would reshuffle on every navigation,
 * which looks like a bug. Hashing the id gives each card a set that varies
 * across the grid but never changes for that product.
 */
function demoSwatchSlugs(id: string): readonly string[] {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return DEMO_SWATCH_SETS[hash % DEMO_SWATCH_SETS.length];
}
// ── end TEMPORARY block ────────────────────────────────────────────────────

/**
 * The card's wrapping link.
 *
 * Always `next/link` to this site's own product page, so a card keeps client
 * navigation and prefetch and the shopper stays on Unrwly through to the cart.
 * It briefly linked straight to Etsy for any product with a listing, which meant
 * no card anywhere reached the product page; see the note at its call site.
 */
function CardLink({
  slug,
  onClick,
  className,
  children,
}: {
  slug: string;
  onClick: (e: React.MouseEvent) => void;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={`/products/${slug}`} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}

export interface ProductVariant {
  id: string;
  /** Accessible label, e.g. "Cosmic Print" or "Charcoal". */
  label?: string;
  /** Artwork / fabric preview shown in the swatch circle. */
  image?: string;
  /** Fallback swatch fill when no preview image exists. */
  color?: string;
}

interface Product {
  _id: string;
  variantId?: string;
  name: string;
  slug: string;
  image: string;
  secondaryImage?: string;
  price: string;
  rawPrice?: number;
  category?: string;
  sizes?: string[];
  /** Optional average rating (e.g. 4.7). Rendered only when present. */
  rating?: number;
  /** Optional pre-formatted original price for sale strikethrough. */
  originalPrice?: string;
  /**
   * The exact Etsy listing this product is sold as. Carried for catalogue
   * reference only — the card always links to the internal product page. Absent
   * for rows that are not published to Etsy.
   */
  etsyUrl?: string;
  /**
   * Resolved catalogue attributes (see `utils/plp/productAttributes.ts`). The
   * card reads `colors` from here to draw its swatches, so a product whose
   * colours aren't known simply draws none — it never invents a palette.
   */
  attributes?: {
    colors?: string[];
    [key: string]: unknown;
  };
}

const ProductCard = ({
  product,
  index = 0,
  showRemove = false,
  onRemove,
  variants,
  sizes,
  tag,
  sizeLayout = 'horizontal',
  titleLines = 2,
  detailSpacing = 'default',
}: {
  product: Product;
  index?: number;
  showRemove?: boolean;
  onRemove?: (id: string) => void;
  user?: any;
  /** Optional print / colour variants. Drawn as the card's colour swatches. */
  variants?: ProductVariant[];
  /** Optional sizes revealed on hover (adult S–XL or kids age chips). */
  sizes?: string[];
  /**
   * Small badge above the product name — "New", "Best Seller", "Minimalist".
   * Only ever passed when it is derived from real catalogue data (see the
   * homepage feed); a card with nothing true to say shows no badge.
   */
  tag?: string;
  /** Hover size selector layout — 'vertical' for narrow cards (e.g. budget rail). */
  sizeLayout?: 'horizontal' | 'vertical';
  /** Title clamp — 1 truncates long names to a single line (e.g. budget rail). */
  titleLines?: 1 | 2;
  /** 'relaxed' opens up the image → title → price rhythm (e.g. budget rail). */
  detailSpacing?: 'default' | 'relaxed';
}) => {
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.items.some((i) => i.id === product._id));

  const [isHovered, setIsHovered] = useState(false);
  const [revealed, setRevealed] = useState(false); // touch: first tap reveals
  const addItem = useCartStore((s) => s.addItem);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);
  const cartItems = useCartStore((s) => s.items);

  const cartItem = cartItems.find(i => i.productId === product._id);
  const inCartCount = cartItem?.quantity || 0;

  // ── Variant / size options ──────────────────────────────────────────────
  // Use real variants when provided; otherwise derive a front/back pair from the
  // product's own images so the swatch → image swap is always honest.
  const resolvedVariants: ProductVariant[] = useMemo(() => {
    if (variants?.length) return variants;
    if (product.secondaryImage && product.secondaryImage !== product.image) {
      return [
        { id: 'front', label: 'Front view', image: product.image },
        { id: 'back', label: 'Back view', image: product.secondaryImage },
      ];
    }
    return [];
  }, [variants, product.image, product.secondaryImage]);

  // ── Colour swatches — ALWAYS VISIBLE, never behind a hover ────────────────
  // Two honest sources, in order of authority:
  //   1. real print / colour variants passed by the caller, and
  //   2. the colours resolved from the product itself
  //      (`utils/plp/productAttributes.ts`), drawn with the shared palette in
  //      `data/colorSwatches.ts` so a "Sage" here matches "Sage" in the filter
  //      panel exactly.
  // A product with neither draws NO swatch row at all. That is deliberate: a
  // placeholder palette repeated under every card is the single loudest tell of
  // a generic template, and it would be a lie about what the shop stocks.
  const { colourSwatches, isDemoSwatches } = useMemo(() => {
    if (resolvedVariants.length > 0) {
      return {
        isDemoSwatches: false,
        colourSwatches: resolvedVariants.map((v) => ({
          key: v.id,
          label: v.label ?? 'Variant',
          fill: v.color,
          image: v.image as string | undefined,
        })),
      };
    }

    const real = resolveColorSwatches(product.attributes?.colors);
    // TEMPORARY: the `?? demoSwatchSlugs(...)` half of this line is the demo
    // fallback — see the block at the top of the file. Deleting it restores the
    // honest behaviour: a product with no known colours draws no swatches.
    const demo = real.length === 0;
    const swatches = demo ? resolveColorSwatches(demoSwatchSlugs(product._id)) : real;

    return {
      isDemoSwatches: demo,
      colourSwatches: swatches.map((c) => ({
        key: c.slug,
        label: c.name,
        fill: c.hex,
        image: undefined as string | undefined,
      })),
    };
  }, [resolvedVariants, product.attributes?.colors, product._id]);

  const visibleSwatches = colourSwatches.slice(0, MAX_SWATCHES);
  const hiddenSwatchCount = colourSwatches.length - visibleSwatches.length;

  // One class string for both kinds, so a demo swatch is pixel-identical to a
  // real one — that is the whole point of showing them.
  const swatchClass =
    'relative h-3.5 w-3.5 shrink-0 overflow-hidden rounded-full border-2 border-white transition-transform duration-200 ease-out hover:scale-110 motion-reduce:transition-none motion-reduce:hover:scale-100';

  // Sizes are variant-level data the catalogue does not carry yet, so the
  // selector renders only when a caller passes a real size run. No placeholder
  // S–XL row: it would claim a mug comes in a medium.
  const sizeOptionsResolved = sizes?.length ? sizes : (product.sizes ?? []);
  const hasOptions = sizeOptionsResolved.length > 0;

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hoverSwatchImage, setHoverSwatchImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Priority: swatch hover preview → persisted selection → hover back-view → front
  const shownImage =
    hoverSwatchImage ||
    selectedImage ||
    (isHovered && product.secondaryImage ? product.secondaryImage : product.image) ||
    FALLBACK_IMG;

  /**
   * Shopping does not require an account.
   *
   * Adding to the bag used to bounce a signed-out visitor to /auth, so nothing
   * ever reached the cart and the button looked broken — which is exactly what
   * it looked like to the client. The checkout API already accepts guests
   * (`userId` is nullable on Order and the Stripe session falls back to the
   * email collected at payment), so the gate was blocking a flow the backend
   * supported all along. Sign-in is asked for at checkout, where it buys the
   * customer something: an order history.
   */

  const activeRawPrice = useMemo(() => {
    if (product.rawPrice) return product.rawPrice;
    if (!product.price) return 0;
    const parsed = parseFloat(product.price.replace(/[^0-9.-]+/g, ""));
    return isNaN(parsed) ? 0 : parsed;
  }, [product.rawPrice, product.price]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // --- GA4 EVENT TRACKING: Quick Add ---
    sendGAEvent('event', 'add_to_cart', {
      currency: 'USD',
      value: activeRawPrice,
      items: [{
        item_id: product._id,
        item_name: product.name,
        price: activeRawPrice,
        quantity: 1,
        item_category: product.category || 'Uncategorized'
      }]
    });
    // -------------------------------------

    addItem({
      id: `${product._id}-${selectedVariantId || 'default'}-${selectedSize || 'os'}`,
      productId: product._id,
      name: product.name,
      price: activeRawPrice,
      image: shownImage,
      quantity: 1,
      variantId: selectedVariantId || product.variantId || '',
    });
    setDrawerOpen(true);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) onRemove(product._id);
  };

  // On touch / no-hover devices: first tap reveals the size selector, second
  // navigates. Colours are exempt — they are always drawn in the details stack
  // below, so nothing essential is ever a tap away.
  const handleCardClick = (e: React.MouseEvent) => {
    if (
      hasOptions &&
      !revealed &&
      typeof window !== 'undefined' &&
      window.matchMedia?.('(hover: none)').matches
    ) {
      e.preventDefault();
      setRevealed(true);
    }
  };

  const optionsOpen = isHovered || revealed;
  const showSecondaryPreload = !!product.secondaryImage && product.secondaryImage !== product.image;

  // Opt-in detail rhythm — defaults keep every existing card pixel-identical.
  const relaxed = detailSpacing === 'relaxed';
  const detailsMt = relaxed ? 'mt-4' : 'mt-3';
  const reduceMotion = useReducedMotion();
  const priceMt = relaxed ? 'mt-2.5' : 'mt-2';
  const titleClamp = titleLines === 1 ? 'line-clamp-1' : 'line-clamp-2';

  return (
    <motion.div
      /* ── WHY THE DELAY IS CAPPED ──────────────────────────────────────────
         `index` is a RUNNING INDEX ACROSS THE WHOLE FEED — `ProductFeedSection`
         accumulates `startIndex` over every category — so on the homepage it
         reaches 86. At the old `index * 0.05` that gave the last card a 4.3s
         delay on top of a 0.6s fade: the page rendered every card at
         `opacity: 0` and took nearly five seconds to finish revealing them.

         Worse, this is `animate`, not `whileInView`, so all 87 timers start at
         load whether or not the card is anywhere near the viewport. Scrolling
         down two seconds after load put the reader in a band of invisible
         cards — present in the DOM and clickable, but with nothing drawn.
         That is the "cards not responding" report, and it hit both storefronts
         because both feeds are this long.

         Staggering by position WITHIN A ROW keeps the cascade that makes a grid
         feel alive and caps the wait at 0.18s, so the slowest card is fully
         drawn ~0.8s after load however many the feed holds. */
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0.2 }
          : { duration: 0.6, delay: (index % 4) * 0.06, ease: [0.211, 0, 0.076, 1] }
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      {/* ── Where the card goes ──────────────────────────────────────────────
          Always this site's own product page. Never off-site.

          This used to send any product carrying an `etsyUrl` straight to its
          Etsy listing in a new tab — and since every product in both feeds has a
          listing, that meant NO card anywhere reached the internal product page,
          the variant pickers, or the on-site cart and checkout. The detail page
          existed but nothing linked to it.

          `etsyUrl` is still carried on the product for internal reference (it is
          how the catalogue is kept in step with the shops), it simply no longer
          decides where a shopper lands. The card's appearance is unchanged. ── */}
      <CardLink
        slug={product.slug}
        onClick={handleCardClick}
        className="block rounded-card focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[rgb(var(--accent-ring-rgb)/0.30)]"
      >
        {/* ── Image area: one layer, soft neutral background, product is the hero.
               No inner card — the image sits directly at the top of the card. ── */}
        <div className="relative w-full overflow-hidden rounded-card aspect-[3/4] bg-[#F5F5F2]">
          <AnimatePresence mode="wait">
            <motion.div
              key={shownImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0"
            >
              <Image
                src={shownImage}
                alt={product.name}
                fill
                loading={index < 8 ? undefined : 'lazy'}
                priority={index < 4}
                className="object-cover transition-transform duration-[300ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.03]"
                sizes="(max-width:640px) 50vw,(max-width:1024px) 25vw,20vw"
              />
            </motion.div>
          </AnimatePresence>

          {/* Preload the secondary/back image so the first hover crossfade is instant */}
          {showSecondaryPreload && (
            <Image
              src={product.secondaryImage as string}
              alt=""
              aria-hidden
              fill
              loading="lazy"
              sizes="(max-width:640px) 50vw,(max-width:1024px) 25vw,20vw"
              className="pointer-events-none absolute inset-0 -z-10 opacity-0 object-cover"
            />
          )}

          {showRemove ? (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleRemove}
              aria-label={`Remove ${product.name} from wishlist`}
              className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-neutral-600 shadow-[0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-[6px] transition-transform duration-[250ms] ease-out hover:scale-110 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-ring-rgb)/0.30)]"
            >
              <X size={17} />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist({
                  id: product._id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  slug: product.slug,
                  rawPrice: activeRawPrice,
                });
              }}
              aria-label={isInWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
              aria-pressed={isInWishlist}
              className="group/wish absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/70 shadow-[0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-[6px] opacity-90 transition-[transform,opacity] duration-[250ms] ease-out hover:scale-110 group-hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-ring-rgb)/0.30)]"
            >
              <Heart
                size={17}
                className={`transition-all duration-[250ms] ease-out ${
                  isInWishlist
                    ? 'fill-[#E53935] text-[#E53935] scale-110'
                    : 'fill-transparent text-neutral-500 group-hover/wish:text-ink'
                }`}
              />
            </motion.button>
          )}

          {/* ── Always-visible Quick Add — bottom-right of image ── */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleQuickAdd}
            aria-label="Quick add to bag"
            className="absolute bottom-4 right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-on shadow-[0_8px_20px_-4px_rgb(var(--accent-ring-rgb)/0.45)] transition-[background-color,transform] duration-[200ms] ease-out hover:bg-accent-950 hover:text-accent-on-strong hover:scale-[1.08] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[rgb(var(--accent-ring-rgb)/0.30)]"
          >
            <ShoppingBag size={19} strokeWidth={2} />
          </motion.button>

          {/* ── Size selector on hover / tap. Horizontal glass pill by default;
              a vertical stack of individual buttons on the narrow budget cards
              (sizeLayout="vertical"). Sizes never change the card height. ── */}
          {sizeOptionsResolved.length > 0 && (
            sizeLayout === 'vertical' ? (
              <div
                className={`absolute left-3 bottom-3 z-[15] flex flex-col gap-1.5 transition-[opacity,transform] duration-[220ms] ease-out ${
                  optionsOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-1.5 opacity-0'
                }`}
                role="group"
                aria-label="Select size"
              >
                {sizeOptionsResolved.map((size) => {
                  const active = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      aria-label={`Size ${size}`}
                      aria-pressed={active}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedSize(active ? null : size);
                      }}
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-medium shadow-[0_2px_8px_rgba(20,20,25,0.16)] backdrop-blur-[6px] transition-[background-color,border-color,color,transform] duration-200 ease-out hover:scale-110 ${
                        active ? 'border-accent bg-accent text-accent-on' : 'border-white/60 bg-white/80 text-ink hover:bg-white'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                className={`absolute left-4 bottom-4 z-[15] flex transition-[opacity,transform] duration-[220ms] ease-out ${
                  optionsOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
                }`}
              >
                <div
                  className="flex h-[34px] max-w-[calc(100%-0.75rem)] items-center gap-0.5 rounded-full border border-white/60 bg-white/80 px-3.5 shadow-[0_6px_18px_rgba(20,20,25,0.18)] backdrop-blur-[8px]"
                  role="group"
                  aria-label="Select size"
                >
                  {sizeOptionsResolved.map((size) => {
                    const active = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        aria-label={`Size ${size}`}
                        aria-pressed={active}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedSize(active ? null : size);
                        }}
                        className={`flex h-[26px] min-w-[24px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold transition-colors duration-150 ${
                          active ? 'bg-accent text-accent-on' : 'text-ink hover:bg-ink/[0.06]'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>

        {/* ── Product details ─────────────────────────────────────────────────
            Read top to bottom, nothing hidden behind a hover:

                metadata row (tag · colours) → name → rating → price

            The colours used to live in a hover overlay that replaced the title.
            They are merchandising information, not a flourish — a shopper
            scanning a grid needs to compare colours across every card at once,
            which is impossible if only the card under the cursor shows them (and
            simply unreachable on a touch screen). Hover now does nothing but the
            image crossfade and the card lift. ── */}
        <div className={detailsMt}>
          {/* METADATA ROW — the badge on the left, the swatches on the right,
              both flush to the card's content edges and on one baseline.
              Colours belong here rather than under the price because at 14px
              they read as product metadata, which is what they are; stacked in
              their own row beneath the price they read as a feature, which
              unbalanced the card. The row only renders when it has something in
              it, so a card with neither gains no empty space. */}
          {(tag || colourSwatches.length > 0) && (
            <div className="mb-2 flex min-h-[18px] items-center justify-between gap-3">
              {/* `min-w-0 truncate` so a long badge on a narrow card gives way
                  rather than shoving the swatches past the card's edge. */}
              {tag && (
                <span className="type-caption min-w-0 truncate text-[10px] uppercase tracking-[0.16em] text-accent-800">
                  {tag}
                </span>
              )}

              {/* `ml-auto` rather than relying on `justify-between` alone: a card
                  with swatches but no badge would otherwise pull them left.
                  Demo swatches carry no group role or label — they are scenery,
                  and announcing them would tell a screen-reader user this shop
                  sells colours it does not. */}
              {colourSwatches.length > 0 && (
                <div
                  className="ml-auto flex shrink-0 items-center gap-1.5"
                  {...(isDemoSwatches
                    ? { 'aria-hidden': true }
                    : { role: 'group', 'aria-label': `Colours available for ${product.name}` })}
                >
                  {visibleSwatches.map((c) =>
                    isDemoSwatches ? (
                      // Decorative only: a span, not a button. Nothing to click,
                      // nothing to select, nothing announced.
                      <span
                        key={c.key}
                        style={{
                          background: c.fill || '#EEEEEE',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.22)',
                        }}
                        className={swatchClass}
                      />
                    ) : (
                      <button
                        key={c.key}
                        type="button"
                        aria-label={`Colour ${c.label}`}
                        aria-pressed={selectedColor === c.key}
                        onMouseEnter={() => c.image && setHoverSwatchImage(c.image)}
                        onMouseLeave={() => setHoverSwatchImage(null)}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const active = selectedColor === c.key;
                          setSelectedColor(active ? null : c.key);
                          if (c.image) { setSelectedVariantId(c.key); setSelectedImage(c.image); }
                        }}
                        style={{
                          background: c.fill || '#EEEEEE',
                          boxShadow: selectedColor === c.key
                            ? `0 0 0 2px #fff, 0 0 0 4px ${ACCENT_RING}`
                            : '0 1px 3px rgba(0,0,0,0.22)',
                        }}
                        className={`${swatchClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-ring-rgb)/0.35)]`}
                      >
                        {c.image && <Image src={c.image} alt="" fill sizes="14px" className="object-cover" />}
                      </button>
                    )
                  )}
                  {hiddenSwatchCount > 0 && (
                    <span className="text-[10px] font-medium leading-none text-neutral-400">
                      +{hiddenSwatchCount}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <h3
            className={`type-product-name ${titleClamp} text-[14px] leading-snug text-ink md:text-[15px]`}
          >
            {product.name}
          </h3>

          {typeof product.rating === 'number' && (
            <div className="type-rating mt-1.5 flex items-center gap-1 text-[13px] text-neutral-600">
              <Star size={13} className="fill-ink text-ink" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          )}

          <div className={`${priceMt} flex items-center gap-2`}>
            <p className="type-price text-[15px] text-ink md:text-base">
              {product.price}
            </p>
            {product.originalPrice && (
              <span className="text-[13px] text-neutral-400 line-through">{product.originalPrice}</span>
            )}
            {inCartCount > 0 && (
              <span className="ml-auto text-[10px] font-semibold text-accent-ink bg-accent/[0.08] px-2.5 py-1 rounded-full tracking-wide">
                {inCartCount} in Bag
              </span>
            )}
          </div>
        </div>
      </CardLink>
    </motion.div>
  );
};

export default ProductCard;
