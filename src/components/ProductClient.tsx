"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowLeft, Star, ShoppingBag, ShieldCheck, Truck, RotateCcw, MapPin, ChevronRight, Heart, Share2, Minus, Plus, ExternalLink, X } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import SectionHeader from '@/components/SectionHeader';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { sendGAEvent } from '@next/third-parties/google'; // Added import

const COLOR_MAP: Record<string, string> = {
  Black: '#000000', White: '#FFFFFF', Red: '#DC2626', Blue: '#2563EB',
  Navy: '#1E3A5F', Green: '#16A34A', Pink: '#EC4899', Beige: '#D4B896',
  Grey: '#6B7280', Brown: '#92400E', Yellow: '#EAB308', Orange: '#EA580C',
  Purple: '#7C3AED',
};

/**
 * One collapsible row of product information.
 *
 * Local to this page rather than reusing `FAQAccordion`: that component takes
 * question/answer strings and carries the FAQ page's card styling (borders,
 * shadow, 32px padding), where these panels hold rendered HTML and want to read
 * as a quiet list of rules under the product.
 *
 * A real <button> with `aria-expanded` and `aria-controls`, so it is reachable
 * and announced by keyboard and screen readers rather than being a div that
 * happens to respond to clicks.
 */
/**
 * A block of existing HTML, clamped until asked to open.
 *
 * ── WHY IT CLAMPS BY HEIGHT AND NOT BY TEXT ─────────────────────────────────
 * The description arrives as HTML (`parsedDetails`), and the brief is explicit
 * that not one word of it may be rewritten, summarised or dropped. Any excerpt
 * built by slicing the string would have to cut inside tags and rebuild them,
 * which is how "preserve the original" quietly becomes "mangle the original".
 *
 * So nothing is extracted. The ENTIRE description is always in the DOM exactly
 * as authored; a `max-height` decides how much of it you can see, and opening
 * removes the height. The preview is therefore generated from the real content
 * by definition, and "Read less" restores byte-identical markup because it was
 * never altered.
 *
 * The button only appears when the content actually overflows — measured, not
 * assumed, and re-measured on resize, so a two-line description on a wide
 * screen does not offer to expand something that is already fully visible.
 */
function ReadMore({ html, collapsedHeight = 176 }: { html: string; collapsedHeight?: number }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => setOverflows(el.scrollHeight > collapsedHeight + 8);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [collapsedHeight, html]);

  const clamped = !expanded && overflows;

  return (
    <div>
      <div className="relative">
        <div
          ref={innerRef}
          style={clamped ? { maxHeight: collapsedHeight } : undefined}
          className={`type-body prose prose-sm max-w-none text-neutral-500 ${clamped ? 'overflow-hidden' : ''}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {/* Not decoration: without it the clamp cuts a line of type in half and
            reads as a rendering fault. White to transparent, so it registers as
            the text running out rather than as a coloured panel. */}
        {clamped && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white to-transparent"
          />
        )}
      </div>

      {overflows && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="type-button mt-3 inline-flex items-center gap-1.5 text-[12px] tracking-[0.06em] text-accent-700 underline underline-offset-4 transition-opacity duration-200 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2"
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

function AccordionRow({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = React.useId();

  return (
    <div>
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          className="type-label flex w-full items-center justify-between gap-4 py-5 text-left text-ink transition-colors duration-200 hover:text-accent-ink focus-visible:outline-none focus-visible:text-accent-ink"
        >
          {title}
          <ChevronRight
            aria-hidden
            size={16}
            strokeWidth={2}
            className={`shrink-0 text-neutral-400 transition-transform duration-200 ease-out ${open ? 'rotate-90' : ''}`}
          />
        </button>
      </h3>
      <div id={`${id}-panel`} hidden={!open} className="pb-6">
        {children}
      </div>
    </div>
  );
}

/**
 * Size charts, in inches, as published by the print provider for these garments.
 *
 * ADULT and YOUTH are genuinely different tables — not the adult one relabelled.
 * A youth L is not an adult L, and a page that showed one chart for both would
 * be actively misleading on the Kids storefront, which is the single most
 * common cause of a returned children's garment.
 */
const SIZE_CHARTS = {
  adult: {
    label: 'Adult sizing',
    headers: ['Size', 'Chest (in)', 'Length (in)'],
    rows: [
      ['XS', '31–34', '27'],
      ['S', '34–37', '28'],
      ['M', '38–41', '29'],
      ['L', '42–45', '30'],
      ['XL', '46–49', '31'],
      ['2XL', '50–53', '32'],
      ['3XL', '54–57', '33'],
    ],
  },
  kids: {
    label: 'Youth sizing',
    headers: ['Size', 'Age', 'Chest (in)'],
    rows: [
      ['XS', '4–5', '24'],
      ['S', '6–7', '26'],
      ['M', '8–9', '28'],
      ['L', '10–11', '30'],
      ['XL', '12–13', '32'],
    ],
  },
} as const;

/** Size guide, as a dialog. Escape closes it, as does the scrim. */
function SizeGuideModal({
  open,
  onClose,
  isKids,
}: {
  open: boolean;
  onClose: () => void;
  isKids: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const chart = isKids ? SIZE_CHARTS.kids : SIZE_CHARTS.adult;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-ink/50 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Size guide"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed left-1/2 top-1/2 z-[90] w-[min(92vw,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="type-label text-ink">Size Guide</h2>
                <p className="type-caption mt-1 text-neutral-500">{chart.label}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close size guide"
                className="-mr-2 -mt-2 flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 transition-colors duration-200 hover:bg-neutral-100 hover:text-ink"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-black/[0.08]">
                    {chart.headers.map((h) => (
                      <th key={h} scope="col" className="type-label py-3 pr-4 text-neutral-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chart.rows.map((row) => (
                    <tr key={row[0]} className="border-b border-black/[0.04] last:border-0">
                      {row.map((cell, i) => (
                        <td
                          key={i}
                          className={`py-3 pr-4 text-sm ${i === 0 ? 'font-semibold text-ink' : 'text-neutral-500'}`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="type-caption mt-6 text-neutral-400">
              Measurements are approximate and may vary slightly between styles.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const CrossSellCarousel = ({ products, user }: { products: any[], user?: any }) => {
  if (!products || products.length === 0) return null;
  return (
    <section className="bg-white px-4 md:px-12 py-16" style={{ borderTop: '1px solid var(--color-hairline)' }}>
      <div className="mx-auto max-w-[1440px]">
        <SectionHeader title="Similar Products" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((product, index) => (
            <ProductCard key={product._id || product.slug} product={product} index={index} user={user} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default function ProductClient({ product, recommendations = [], user, etsyUrl }: ProductClientProps) {
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  /** Index of the image shown large on desktop. Thumbnails drive it. */
  const [activeImage, setActiveImage] = useState(0);
  /** Set when Add to Bag is pressed without a required size chosen. */
  const [sizeError, setSizeError] = useState(false);
  // Kids products get youth sizing and youth guidance; the two catalogues do not
  // share a size chart, and showing an adult one on a toddler tee is worse than
  // showing none.
  const isKids = product.audience === 'KIDS';
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<null | 'valid' | 'invalid'>(null);
  const [currentSlide, setCurrentSlide] = useState(1);

  const addItem = useCartStore((state) => state.addItem);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);

  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isInWishlist = useWishlistStore((state) => state.items.some(i => i.id === product._id));

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

  const activePriceDisplay = product.price;
  const activePriceNumber = useMemo(() => {
    if (typeof activePriceDisplay === 'number') return activePriceDisplay;
    return parseFloat(activePriceDisplay.replace(/[^0-9.-]+/g, ""));
  }, [activePriceDisplay]);

  // --- GA4 EVENT TRACKING: view_item ---
  useEffect(() => {
    if (product) {
      sendGAEvent('event', 'view_item', {
        currency: 'USD',
        value: activePriceNumber,
        items: [{
          item_id: product._id,
          item_name: product.name,
          price: activePriceNumber,
          item_category: product.category || 'Uncategorized'
        }]
      });
    }
  }, [product, activePriceNumber]);
  // -------------------------------------

  const handleToggleWishlist = () => {

    // --- GA4 EVENT TRACKING: add_to_wishlist ---
    if (!isInWishlist) {
      sendGAEvent('event', 'add_to_wishlist', {
        currency: 'USD',
        value: activePriceNumber,
        items: [{
          item_id: product._id,
          item_name: product.name,
          price: activePriceNumber
        }]
      });
    }
    // -------------------------------------------

    toggleWishlist({
      id: `${product._id}`,
      name: product.name,
      price: product.price,
      image: images[0],
      slug: product.slug,
      rawPrice: activePriceNumber,
    });
  };

  const images = useMemo(() => {
    let raw: any[] = [];
    if (product.allImages && product.allImages.length > 0) raw = product.allImages;
    else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      raw = product.images.map((img: any) => typeof img === 'string' ? img : img.src);
    }
    else if (product.image) raw = [product.image];

    const filtered = raw.filter((img: any) => typeof img === 'string' && img.trim() !== '');
    return filtered.length > 0 ? filtered : ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"];
  }, [product.allImages, product.images, product.image]);

  const variants = product.variants || [];

  /**
   * Colour and size, decoded from the variant title.
   *
   * ── WHY THIS CHANGED ───────────────────────────────────────────────────────
   * This used to read `v.color` and `v.size`. Printify's variants have neither
   * field: a variant carries a `title` of the form "Black / M" — colour, slash,
   * size — which is exactly how `fetchPrintifyMockups` in lib/printify.ts has
   * always read them. So both sets came out empty on every product, and the
   * colour and size selectors below silently rendered nothing. The controls
   * were there; they had simply never had anything to show.
   *
   * Availability is real too. `isOutOfStock` was previously hardcoded to treat
   * XS and XXL as sold out on every product in the catalogue, whatever the
   * actual stock — so shoppers were blocked from buying sizes that were
   * available, and never warned about ones that were not. Printify marks each
   * variant `is_enabled` (the shop sells it) and `is_available` (the provider
   * can make it right now); a size counts as orderable if any variant offering
   * it satisfies both.
   */
  const { availableColors, availableSizes, unavailableSizes, colorHexes } = useMemo(() => {
    const colors = new Set<string>();
    const sizes = new Set<string>();
    const orderable = new Set<string>();
    /**
     * Real swatch colours, from Printify.
     *
     * Each colour option value carries its own hex (`values[].colors[0]`), so
     * "Heather Grey" is #B7B6B5 and "Solid Royal" is #003479 — the actual
     * garment. The local `COLOR_MAP` above is keyed on bare names ("Black",
     * "Grey"), which never match what the API returns ("Solid Black", "Heather
     * Grey", "Vintage Coyote Brown"), so every swatch on the site fell through
     * to its `#888` default and the picker showed a row of identical grey dots.
     * COLOR_MAP stays as the fallback for a product whose options carry no hex.
     */
    const hexes = new Map<string, string>();

    // `product.options` declares what each position in `variant.options` MEANS,
    // and the order is per-product, not a convention:
    //
    //   Adult tee   options [size, color]  → title "S / Solid Black"
    //   Kids tee    options [color, size]  → title "Vintage Coyote Brown / 4T"
    //
    // So splitting the title on "/" and taking the first half as the colour —
    // which an earlier pass here did — reads the adult catalogue exactly
    // backwards and files "Solid Black" as a size. Resolving through the option
    // metadata is order-independent and right for both.
    const options: any[] = Array.isArray(product.options) ? product.options : [];
    const valueTitles = options.map((o) => {
      const byId = new Map<number, string>();
      for (const val of o?.values ?? []) {
        byId.set(val.id, val.title);
        const hex = Array.isArray(val.colors) ? val.colors[0] : undefined;
        if (o?.type === 'color' && val.title && hex) hexes.set(val.title, hex);
      }
      return byId;
    });

    for (const v of variants as any[]) {
      const isOrderable = v.is_enabled !== false && v.is_available !== false;

      let color: string | undefined;
      let size: string | undefined;

      if (options.length && Array.isArray(v.options)) {
        v.options.forEach((valueId: number, i: number) => {
          const title = valueTitles[i]?.get(valueId);
          if (!title) return;
          if (options[i]?.type === 'color') color = title;
          if (options[i]?.type === 'size') size = title;
        });
      } else {
        // Fallback for a product with no option metadata: the title is all we
        // have. Deliberately assigns nothing rather than guessing which half is
        // which, so a malformed product shows no selectors instead of wrong ones.
        const parts = String(v.title ?? '').split('/').map((s) => s.trim());
        if (parts.length === 1 && parts[0]) color = parts[0];
      }

      if (color) colors.add(color);
      if (size) {
        sizes.add(size);
        if (isOrderable) orderable.add(size);
      }
    }

    return {
      colorHexes: hexes,
      availableColors: Array.from(colors),
      availableSizes: Array.from(sizes),
      // Known to the product but not orderable — shown muted and disabled
      // rather than hidden, so the range reads honestly.
      unavailableSizes: new Set([...sizes].filter((s) => !orderable.has(s))),
    };
  }, [variants, product.options]);

  // NO INVENTED REFERENCE PRICE.
  //
  // This page used to print `MRP $X` struck through beside every price, with
  // "(33% OFF)" next to it — where X was the price multiplied by 1.5 and 33 was
  // a literal. Neither came from the product: every item in the shop carried an
  // identical fictional discount off an identical fictional was-price.
  //
  // Beyond being untrue, a struck-through price the product was never sold at is
  // a regulated claim, not a styling choice (UK CMA pricing guidance, EU Omnibus
  // Directive art. 6a, FTC deceptive-pricing rules) — and the figure disagreed
  // with the Etsy listing the same product links to, which is the price a
  // customer actually pays. If a genuine was-price is ever recorded on the
  // product, it can be rendered here from that field; until then the page shows
  // the one price that is real.

  const handleAddToCart = () => {

    // A garment with sizes cannot be ordered without one — the cart would carry
    // an item nobody can fulfil. Surfaced inline next to the picker rather than
    // as an alert, and cleared as soon as a size is chosen.
    if (availableSizes.length > 0 && !selectedSize) {
      setSizeError(true);
      document.getElementById('size-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSizeError(false);

    // --- GA4 EVENT TRACKING: Detailed add_to_cart ---
    sendGAEvent('event', 'add_to_cart', {
      currency: 'USD',
      value: activePriceNumber,
      items: [{
        item_id: product._id,
        item_name: product.name,
        price: activePriceNumber,
        quantity,
        item_variant: `${selectedColor} ${selectedSize}`.trim() || 'Default'
      }]
    });
    // ------------------------------------------------

    addItem({
      // Variant-scoped line id — see the note on CartItem.id. Two sizes of the
      // same garment are two lines, not one line of quantity 2.
      id: [product._id, selectedSize, selectedColor].filter(Boolean).join('-'),
      productId: product._id,
      name: product.name,
      price: activePriceNumber,
      image: images[0],
      quantity,
      variantId: product.variantId,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });
    setDrawerOpen(true);
  };

  const handlePincodeCheck = () => {
    if (pincode.length === 6) setPincodeStatus('valid');
    else setPincodeStatus('invalid');
  };

  const { parsedFeatures, parsedCare, parsedDetails } = useMemo(() => {
    const html = product.description || '';
    let f = '';
    let c = '';
    let d = html;

    const fMarkers = ['Product features', 'Key features', 'Features:'];
    const cMarkers = ['Care instructions', 'Care:'];

    let fIdx = -1;
    let fMarker = '';
    for (const m of fMarkers) {
      const idx = html.toLowerCase().indexOf(m.toLowerCase());
      if (idx !== -1 && (fIdx === -1 || idx < fIdx)) { fIdx = idx; fMarker = m; }
    }

    let cIdx = -1;
    let cMarker = '';
    for (const m of cMarkers) {
      const idx = html.toLowerCase().indexOf(m.toLowerCase());
      if (idx !== -1 && (cIdx === -1 || idx < cIdx)) { cIdx = idx; cMarker = m; }
    }

    if (fIdx !== -1 && cIdx !== -1) {
      if (fIdx < cIdx) {
        d = html.substring(0, fIdx);
        f = html.substring(fIdx + fMarker.length, cIdx);
        c = html.substring(cIdx + cMarker.length);
      } else {
        d = html.substring(0, cIdx);
        c = html.substring(cIdx + cMarker.length, fIdx);
        f = html.substring(fIdx + fMarker.length);
      }
    } else if (fIdx !== -1) {
      d = html.substring(0, fIdx);
      f = html.substring(fIdx + fMarker.length);
    } else if (cIdx !== -1) {
      d = html.substring(0, cIdx);
      c = html.substring(cIdx + cMarker.length);
    }

    const clean = (s: string) => s.replace(/^[:\s-]+|[:\s-]+$/g, '').trim();
    return { parsedFeatures: clean(f), parsedCare: clean(c), parsedDetails: clean(d) };
  }, [product.description]);

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white text-neutral-500 font-sans selection:bg-ink selection:text-white">
      {/* max-w-[1440px] + px-4/md:px-12 is the container the homepage sections
          already use. The page sat in a max-w-7xl (1280px) box with 48px
          gutters, so on a 1600px display it floated in ~200px of dead margin on
          each side while the gallery and the buy column fought over the middle. */}
      <div className="hidden md:block mx-auto max-w-[1440px] px-4 md:px-12 pt-10 pb-4">
        <nav className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
          <Link href="/" className="hover:text-ink">Home</Link>
          <ChevronRight size={10} />
          <Link href="/collections" className="hover:text-ink">{product.category || 'Collection'}</Link>
          <ChevronRight size={10} />
          <span className="text-ink font-bold">{product.name}</span>
        </nav>
      </div>

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-0 pb-20 md:px-4 lg:grid-cols-12 lg:gap-x-16 lg:px-12">

        <div className="lg:col-span-7">
          {/* ── Desktop gallery: thumbnail rail + one large image ─────────────
              This was a two-up grid of every image at equal size, which gave a
              product's fifth mockup the same prominence as its first and left
              the hero looking like a contact sheet. A detail page has one
              subject: the product, shown as large as the column allows, with the
              other angles available beside it.

              Only the active image is fetched with priority — the rail's
              thumbnails are small and lazy, so the large image still gets the
              bandwidth on first paint. ── */}
          <div className="hidden lg:flex gap-3">
            {images.length > 1 && (
              <div
                role="listbox"
                aria-label="Product images"
                className="no-scrollbar flex max-h-[720px] w-[76px] shrink-0 flex-col gap-2 overflow-y-auto"
              >
                {images.map((img: string, idx: number) => {
                  const isActive = idx === activeImage;
                  return (
                    <button
                      key={idx}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      aria-label={`View image ${idx + 1} of ${images.length}`}
                      onClick={() => setActiveImage(idx)}
                      onMouseEnter={() => setActiveImage(idx)}
                      className={`relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-surface transition-[border-color,opacity] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                        isActive
                          ? 'border border-ink opacity-100'
                          : 'border border-hairline opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt=""
                        fill
                        className="object-cover"
                        loading="lazy"
                        sizes="76px"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            <div
              className="relative min-w-0 flex-1 overflow-hidden bg-surface"
              style={{ aspectRatio: '3/4', border: '1px solid var(--color-hairline)' }}
            >
              <Image
                key={images[activeImage]}
                src={images[activeImage]}
                alt={`${product.name} — image ${activeImage + 1} of ${images.length}`}
                fill
                className="object-cover"
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
              />
            </div>
          </div>

          <div className="lg:hidden relative">
            <div
              ref={scrollRef}
              onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                const slide = Math.round(target.scrollLeft / target.clientWidth) + 1;
                setCurrentSlide(slide);
              }}
              className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar aspect-[3/4]"
            >
              {images.map((img: string, idx: number) => (
                <div key={idx} className="min-w-full snap-center relative">
                  <Image src={img} alt={product.name} fill className="object-cover" priority={idx === 0} />
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 right-4 bg-ink/60 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
              {currentSlide} / {images.length}
            </div>
            <div className="absolute top-4 right-4 flex flex-col gap-3">
              <button
                onClick={handleToggleWishlist}
                className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-colors overflow-hidden group/heart"
              >
                <Heart
                  size={20}
                  className={`transition-colors duration-200 ${isInWishlist ? 'fill-accent-700 text-accent-700' : 'text-neutral-400 group-hover/heart:text-accent-700'}`}
                />
              </button>
              <button className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-neutral-400 hover:text-ink transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Sticks beside the gallery. No inner max-height/overflow: a panel that
            scrolls inside a page that also scrolls gives two scrollbars and traps
            the wheel when the cursor is over it. Sticky alone is enough — a panel
            taller than the viewport simply scrolls with the page. */}
        <div className="lg:col-span-5 px-6 md:px-0 lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <p className="type-label text-ink">UNRWLY</p>
              {/* Product name is product information, not editorial display type:
                  `font-sans` keeps it on Manrope against the global h1 default. */}
              <h1 className="type-product-name font-sans text-lg leading-snug text-ink uppercase md:text-xl">{product.name}</h1>
            </div>

            <hr className="border-neutral-100" />

            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="type-price text-2xl text-ink md:text-[26px]">{activePriceDisplay}</span>
              </div>
              <p className="type-caption text-[11px] uppercase tracking-[0.14em] text-neutral-400">inclusive of all taxes</p>
            </div>

            <div className="space-y-6 pt-4">
              {availableSizes.length > 0 && (
                <div className="space-y-4" id="size-selector">
                  <div className="flex justify-between items-center">
                    <span className="type-label text-ink">
                      Size{selectedSize ? <span className="ml-2 font-medium normal-case tracking-normal text-neutral-500">{selectedSize}</span> : null}
                    </span>
                    <button type="button" onClick={() => setSizeGuideOpen(true)} className="type-button text-[11px] tracking-[0.06em] text-accent-700 underline underline-offset-4 transition-opacity duration-200 hover:opacity-70">Size guide</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map(size => {
                      const isActive = selectedSize.toUpperCase() === size.toUpperCase();
                      // Real availability, from the variant data — see the note on
                      // availableSizes above. Never a hardcoded size list.
                      const isOutOfStock = unavailableSizes.has(size);
                      return (
                        <button
                          key={size}
                          disabled={isOutOfStock}
                          aria-label={isOutOfStock ? `Size ${size} — unavailable` : `Size ${size}`}
                          onClick={() => { setSelectedSize(isActive ? '' : size); setSizeError(false); }}
                          className={`relative flex h-11 min-w-[2.75rem] items-center justify-center rounded-card border px-3 text-[13px] font-semibold transition-colors duration-200 ${
                            isOutOfStock ? 'opacity-20 cursor-not-allowed overflow-hidden' : ''
                          } ${
                            // Selection reads in the accent, like every other active
                            // state on the site, so it follows the storefront toggle
                            // instead of staying Myntra pink in both.
                            isActive
                              ? 'border-accent-700 bg-accent-50 text-accent-ink'
                              : isOutOfStock
                                ? 'border-hairline text-ink'
                                : 'border-neutral-300 text-ink'
                          }`}
                        >
                          {size}
                          {isOutOfStock && <div className="absolute inset-0 border-t border-neutral-400 -rotate-45" />}
                        </button>
                      );
                    })}
                  </div>
                  {sizeError && (
                    <p role="alert" className="type-caption text-brand-terracotta">
                      Please select a size before adding to your bag.
                    </p>
                  )}
                </div>
              )}

              {availableColors.length > 0 && (
                <div className="space-y-4">
                  <span className="type-label block text-ink">
                    Color{selectedColor ? <span className="ml-2 font-medium normal-case tracking-normal text-neutral-500">{selectedColor}</span> : null}
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map(color => {
                      const isActive = selectedColor.toLowerCase() === color.toLowerCase();
                      const hex = colorHexes.get(color) || COLOR_MAP[color] || '#888';
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(isActive ? '' : color)}
                          aria-label={`Colour ${color}`}
                          aria-pressed={isActive}
                          title={color}
                          className={`h-7 w-7 rounded-full p-0.5 transition-shadow duration-200 ${isActive ? 'ring-2 ring-ink ring-offset-2' : 'ring-1 ring-black/10 hover:ring-black/25'}`}
                        >
                          <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: hex }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Quantity ──────────────────────────────────────────────────
                Compact by design: it sits beside the price, not above the CTA,
                because quantity is an adjustment most shoppers never touch and
                a full-width stepper would push Add to Bag further down. */}
            <div className="mt-8 flex items-center gap-4">
              <span className="type-label text-neutral-500">Qty</span>
              <div className="inline-flex items-center border border-neutral-300">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="flex h-10 w-10 items-center justify-center text-ink transition-colors duration-200 hover:bg-neutral-50 disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                >
                  <Minus size={14} strokeWidth={2} />
                </button>
                <span
                  aria-live="polite"
                  className="type-product-name w-10 text-center text-sm text-ink"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  disabled={quantity >= 10}
                  aria-label="Increase quantity"
                  className="flex h-10 w-10 items-center justify-center text-ink transition-colors duration-200 hover:bg-neutral-50 disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                >
                  <Plus size={14} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Both buttons come from the shared commerce classes, so this is
                the same button the homepage card, the cart drawer and the Pay
                step use. They used to be hand-rolled here — 14px uppercase at
                0.15em with square corners — which is exactly the drift that made
                the purchase path look like three different sites. */}
            <div className="hidden md:grid grid-cols-2 gap-3 mt-4">
              <button onClick={handleAddToCart} className="btn-commerce">
                <ShoppingBag aria-hidden size={15} strokeWidth={2} /> Add to Bag
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`btn-commerce-secondary group/wish ${
                  isInWishlist ? 'text-accent-700' : 'text-neutral-500'
                }`}
              >
                <Heart aria-hidden size={15} strokeWidth={2} className={isInWishlist ? 'fill-accent-700' : 'transition-colors'} />
                {isInWishlist ? 'In Wishlist' : 'Wishlist'}
              </button>
            </div>

            <div className="mt-6 space-y-2.5 py-6" style={{ borderTop: '1px solid var(--color-hairline)' }}>
              <div className="flex items-center gap-3">
                <ShieldCheck size={15} className="shrink-0 text-neutral-400" />
                <span className="text-[12px] font-medium text-neutral-500">100% Original Products</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw size={15} className="shrink-0 text-neutral-400" />
                <span className="text-[12px] font-medium text-neutral-500">Easy 14-day Returns & Exchange</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={15} className="shrink-0 text-neutral-400" />
                <span className="text-[12px] font-medium text-neutral-500">Pay on Delivery Available</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck size={15} className="shrink-0 text-neutral-400" />
                <span className="text-[12px] font-medium text-neutral-500">Free Delivery on orders above $50</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white flex p-3 gap-3 border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <button
          onClick={handleToggleWishlist}
          className={`btn-commerce-secondary flex-1 ${
            isInWishlist ? 'text-accent-700' : 'text-neutral-500'
          }`}
        >
          <Heart aria-hidden size={15} strokeWidth={2} className={isInWishlist ? 'fill-accent-700' : ''} /> {isInWishlist ? 'Wishlisted' : 'Wishlist'}
        </button>
        <button
          onClick={handleAddToCart}
          className="btn-commerce flex-[1.5]"
        >
          <ShoppingBag aria-hidden size={15} strokeWidth={2} /> Add to Bag
        </button>
      </div>

      {/* ── PRODUCT INFORMATION ────────────────────────────────────────────
          Accordions rather than three columns of prose: on a phone the old
          layout stacked into one long wall, and most shoppers want one of these
          answers, not all four.

          EVERY PANEL IS CONDITIONAL. The previous version rendered all three
          unconditionally and filled empty ones with invented copy — "Ethically
          Sourced Materials", a full set of washing instructions — for products
          whose description said nothing of the kind. A care instruction the
          brand never gave is a claim about a garment nobody verified, so a
          section with no real data is now simply not rendered. Shipping &
          Returns is the one constant, because it is Unrwly policy and true of
          every order. */}
      {/* ── WIDTH ────────────────────────────────────────────────────────
          980px, and the number is doing two jobs at once.

          It was `max-w-3xl` (768px), then briefly `max-w-[68ch]` — which was a
          mistake, because `ch` is the width of a "0" and at this 16px body step
          that resolves to about 578px. Aiming for a reading measure made the
          column NARROWER than the 768px it replaced, which is the cramped
          paragraph in a field of empty page this is fixing.

          980px is ~73% of the 1344px the page container offers at its widest,
          inside the 70–85% the brief asks for, and it holds the body copy at
          roughly 100 characters a line — the top of a comfortable measure
          rather than past it. So the panels fill their container completely;
          there is no second, narrower column inside this one leaving a gap of
          its own.

          The rules and the chevrons therefore run the full 980px while the
          prose still breaks where prose should. Nothing here changes the type
          size: the body step is already 15→16px, and the problem was never the
          type. ── */}
      <section className="border-t border-neutral-100 bg-white px-6 py-14 md:px-8 lg:px-12">
        <div className="mx-auto max-w-[980px] divide-y divide-black/[0.06] border-y border-black/[0.06]">
          {parsedDetails && (
            <AccordionRow title="Product Details" defaultOpen>
              <ReadMore html={parsedDetails} />
            </AccordionRow>
          )}

          {parsedFeatures && (
            <AccordionRow title="Materials & Features">
              <div
                className="type-body prose prose-sm max-w-none text-neutral-500"
                dangerouslySetInnerHTML={{ __html: parsedFeatures }}
              />
            </AccordionRow>
          )}

          <AccordionRow title="Size & Fit">
            <div className="type-body space-y-3 text-neutral-500">
              <p>
                {isKids
                  ? 'Youth sizing. Ages vary by garment — check the size guide for the chest and length measurements of this style before ordering.'
                  : 'Unisex adult sizing with a relaxed fit. Between sizes, size down for a closer fit or stay for a roomier one.'}
              </p>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="type-button text-[12px] uppercase tracking-[0.1em] text-accent-ink underline underline-offset-4 hover:opacity-70"
              >
                View size guide
              </button>
            </div>
          </AccordionRow>

          {parsedCare && (
            <AccordionRow title="Care Instructions">
              <div
                className="type-body prose prose-sm max-w-none text-neutral-500"
                dangerouslySetInnerHTML={{ __html: parsedCare }}
              />
            </AccordionRow>
          )}

          <AccordionRow title="Shipping & Returns">
            <div className="type-body space-y-3 text-neutral-500">
              <p>
                Every UNRWLY piece is made to order, so allow a short production
                window before dispatch on top of the shipping time.
              </p>
              <p>
                For full delivery, returns and exchange terms, see our{' '}
                <Link href="/policies/shipping" className="text-accent-ink underline underline-offset-4">
                  shipping policy
                </Link>{' '}
                and{' '}
                <Link href="/policies/refund" className="text-accent-ink underline underline-offset-4">
                  refund policy
                </Link>
                .
              </p>
            </div>
          </AccordionRow>
        </div>

        {/* ── About UNRWLY — deliberately small, per the brief. ──────────
            Centred on purpose and kept that way: it is a three-line sign-off
            under a rule, not a content column, and centring is what marks it as
            the end of the page rather than another unlabelled panel. What
            changed is that it now centres inside the SAME 980px the accordions
            use, so it is measured against them instead of against its own
            leftover `max-w-3xl`. Its 56ch line is a touch wider than before and
            still well short of the panels above, which is what keeps it reading
            as a coda. ── */}
        <div className="mx-auto mt-16 max-w-[980px] text-center">
          <p className="type-label mb-3 text-neutral-400">Designed by UNRWLY</p>
          <p className="type-body mx-auto max-w-[56ch] text-neutral-500">
            Original prints, drawn in-house and printed to order. Every piece is
            made when you buy it, so nothing sits in a warehouse and nothing goes
            to landfill unsold.
          </p>
        </div>
      </section>

      <CrossSellCarousel products={recommendations} user={user} />

      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} isKids={isKids} />
    </div>
  );
}

interface ProductClientProps {
  product: any;
  recommendations?: any[];
  user?: any;
  /** This product's exact Etsy listing, when it has one. Backs the secondary CTA. */
  etsyUrl?: string;
}
