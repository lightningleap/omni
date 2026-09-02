import { prisma } from "./prisma";

export interface PrintifyProduct {
  _id: string;
  name: string;
  description: string;
  descriptionHtml?: string;
  image: string;
  rawPrice: number;
  slug: string;
  category?: string;
  /** The Printify shop this product was pulled from — decides ADULT vs KIDS. */
  shopId?: string;
}

/**
 * Returns the list of Printify shop ids to sync from. Supports multiple stores
 * via PRINTIFY_SHOP_IDS (comma-separated); falls back to the single PRINTIFY_SHOP_ID.
 */
export function getPrintifyShopIds(): string[] {
  const multi = process.env.PRINTIFY_SHOP_IDS;
  if (multi && multi.trim()) return multi.split(",").map((s) => s.trim()).filter(Boolean);
  const single = process.env.PRINTIFY_SHOP_ID;
  return single ? [single] : [];
}

/**
 * Which Printify shops stock the children's range.
 *
 *   PRINTIFY_KIDS_SHOP_IDS=27560160
 *
 * The storefront splits its whole navigation on ADULT vs KIDS, but Printify has
 * no such concept — the only signal is which store a product lives in. Without
 * this mapping every synced product falls back to the schema default (ADULT),
 * which is how children's tees end up listed under Adult.
 */
export function getKidsShopIds(): string[] {
  const raw = process.env.PRINTIFY_KIDS_SHOP_IDS || "";
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

/** The audience a product inherits from the shop it was pulled from. */
export function audienceForShop(shopId: string | undefined): "ADULT" | "KIDS" {
  return shopId && getKidsShopIds().includes(shopId) ? "KIDS" : "ADULT";
}

/**
 * Picks the mockup Printify itself treats as the product's primary image.
 *
 * `images[0]` is NOT reliably that image — the array is ordered by mockup
 * generation, so the first entry is often an incidental camera angle (and on
 * some products a stale one whose CDN object has since been replaced). Printify
 * flags the real one with `is_default`, falling back to whichever mockup is
 * selected for publishing.
 */
function pickPrimaryPrintifyImage(images: any[]): string {
  if (!Array.isArray(images) || images.length === 0) return "";
  const chosen =
    images.find((i) => i?.is_default) ??
    images.find((i) => i?.is_selected_for_publishing) ??
    images[0];
  return chosen?.src || "";
}

/**
 * Fetches ALL products across every configured shop, paginating through each.
 *
 * `complete` reports whether every page of every shop was read. A rate-limited
 * or failed page stops that shop's pagination and yields a partial catalogue,
 * which is fine for read-only callers (sitemap, related products) but must
 * never be treated as "the full truth" by the sync — see
 * syncStorefrontWithPrintify, which would otherwise draft the entire store the
 * first time Printify returns a 429.
 */
export async function fetchPrintifyCatalog(): Promise<{
  products: PrintifyProduct[] | null;
  complete: boolean;
}> {
  const token = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_TOKEN;
  const shopIds = getPrintifyShopIds();
  if (!token || shopIds.length === 0) return { products: null, complete: false };

  const headers = { "Authorization": `Bearer ${token}`, "User-Agent": "Unrwly/1.0" };
  const all: PrintifyProduct[] = [];
  let complete = true;

  try {
    for (const shopId of shopIds) {
      let page = 1;
      let lastPage = 1;
      do {
        const res = await fetch(
          `https://api.printify.com/v1/shops/${shopId}/products.json?page=${page}`,
          { headers }
        );
        if (!res.ok) {
          console.error(`fetchPrintifyCatalog: shop ${shopId} page ${page} -> ${res.status}`);
          complete = false;
          break;
        }
        const data = await res.json();
        lastPage = data.last_page || 1;
        for (const p of data.data || []) {
          all.push({
            _id: p.id,
            name: p.title,
            description: p.description,
            descriptionHtml: p.description,
            image: pickPrimaryPrintifyImage(p.images),
            rawPrice: (p.variants?.[0]?.price || 0) / 100,
            slug: p.id,
            shopId,
          });
        }
        page++;
      } while (page <= lastPage && page <= 20); // safety cap: 20 pages/shop
      if (lastPage > 20) complete = false;
    }
    return { products: all, complete };
  } catch (err) {
    console.error("fetchPrintifyCatalog Error:", err);
    return { products: all.length ? all : null, complete: false };
  }
}

/**
 * Back-compat wrapper for read-only callers that only need the list.
 */
export async function fetchPrintifyProducts(): Promise<PrintifyProduct[] | null> {
  const { products } = await fetchPrintifyCatalog();
  return products;
}

/**
 * Fetches single product details from Printify.
 *
 * Searches every configured shop, not just PRINTIFY_SHOP_ID. The storefront is
 * stocked from two Printify stores — Adult and Kids — and a product id is only
 * valid in the store that owns it: asking the wrong one returns 400. Looking in
 * the primary store alone meant every Kids product detail page 404'd, because
 * the page treats "Printify has no such product" as "this product does not
 * exist". The primary shop is tried first, so the common case still costs one
 * request.
 */
export async function fetchPrintifyProductById(productId: string) {
  const token = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_TOKEN;
  if (!token) return null;

  const primary = process.env.PRINTIFY_SHOP_ID;
  const shopIds = getPrintifyShopIds();
  const ordered = primary
    ? [primary, ...shopIds.filter((id) => id !== primary)]
    : shopIds;

  if (ordered.length === 0) return null;

  for (const shopId of ordered) {
    try {
      const res = await fetch(
        `https://api.printify.com/v1/shops/${shopId}/products/${productId}.json`,
        { headers: { "Authorization": `Bearer ${token}` } }
      );

      if (res.ok) return await res.json();
      // 400/404 just means "not this shop's product" — keep looking.
    } catch (err) {
      console.error(`fetchPrintifyProductById(${productId}) shop ${shopId}:`, err);
    }
  }

  return null;
}

/**
 * Fetches an existing product's mockups — one per colour — for the admin editor.
 * Returns [{ src, color }] using the front-facing camera for each colour.
 */
export async function fetchPrintifyMockups(printifyId: string): Promise<{ src: string; color: string }[]> {
  const product = await fetchPrintifyProductById(printifyId);
  if (!product) return [];

  const variants: any[] = product.variants || [];
  const colorOf = new Map<number, string>();
  for (const v of variants) {
    const color = (v.title || "").split("/")[0].trim() || "Default";
    colorOf.set(v.id, color);
  }

  const images: any[] = product.images || [];
  const seen = new Set<string>();
  const out: { src: string; color: string }[] = [];
  for (const img of images) {
    if (!(img.is_default || /front/i.test(img.position || ""))) continue;
    const color = colorOf.get(img.variant_ids?.[0]) || img.position || "Default";
    if (seen.has(color)) continue;
    seen.add(color);
    if (img.src) out.push({ src: img.src, color });
    if (out.length >= 16) break;
  }
  return out;
}

/**
 * Automates the handoff from a Prisma Order to the Printify Production Pipeline.
 * 1. Resolves variants and SKUs.
 * 2. Maps shipping details.
 * 3. Pushes to Printify API.
 * 4. Updates Order status to PROCESSING or MANUAL_INTERVENTION_REQUIRED.
 */
export async function createPrintifyOrder(orderId: string, stripeObject?: any) {
  const shopId = process.env.PRINTIFY_SHOP_ID;
  const token = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_TOKEN;

  if (!shopId || !token) {
    console.error("[PRINTIFY] Credentials missing for fulfillment.");
    return { success: false, error: "CREDENTIALS_MISSING" };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: { include: { product: true } }
      }
    });

    if (!order) return { success: false, error: "ORDER_NOT_FOUND" };

    // --- SECURE ADDRESS PARSING ---
    // Rule: Prioritize the Stripe object (verified) over the database fallback string.
    let firstName = "Customer";
    let lastName = "Unrwly";
    let email = "";
    let address = {
      country: "US",
      region: "",
      city: "",
      address1: "",
      address2: "",
      zip: ""
    };

    if (stripeObject) {
      console.log(`[PRINTIFY] Using Stripe Object for address sync: ${stripeObject.id}`);
      const shipping = stripeObject.shipping_details || stripeObject.shipping;
      const nameParts = (shipping?.name || stripeObject.customer_details?.name || "Customer").split(' ');
      
      firstName = nameParts[0];
      lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : "Unrwly";
      email = stripeObject.customer_details?.email || "";
      
      const addr = shipping?.address;
      address = {
        country: addr?.country || "US",
        region: addr?.state || "",
        city: addr?.city || "",
        address1: addr?.line1 || "",
        address2: addr?.line2 || "",
        zip: addr?.postal_code || ""
      };
    } else {
      console.log(`[PRINTIFY] Falling back to database address string for: ${orderId}`);
      // Format: "Name | Email | Line1, City, State Zip, Country"
      const [name, dbEmail, addressPart] = (order.shippingAddress || "").split(" | ");
      const nameParts = (name || "Customer").split(' ');
      firstName = nameParts[0];
      lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : "Unrwly";
      email = dbEmail || "";
      
      const addressDetails = addressPart?.split(", ") || [];
      address = {
        country: addressDetails[addressDetails.length - 1] || "US",
        region: addressDetails[addressDetails.length - 2]?.split(' ')[0] || "",
        city: addressDetails[addressDetails.length - 3] || "",
        address1: addressDetails[0] || "",
        address2: addressDetails[1] || "",
        zip: addressDetails[addressDetails.length - 2]?.split(' ').slice(1).join(' ') || ""
      };
    }

    const printifyLineItems = await Promise.all(order.items.map(async item => {
      // Re-fetch to ensure we have the latest variant list
      const pRes = await fetch(`https://api.printify.com/v1/shops/${shopId}/products/${item.product.printifyId}.json`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const pData = pRes.ok ? await pRes.json() : null;
      
      return {
        product_id: item.product.printifyId,
        variant_id: pData?.variants?.[0]?.id || item.variantId || 1, // Fallback order: API -> DB -> Default
        quantity: item.quantity
      };
    }));

    const printifyPayload = {
      external_id: order.id,
      label: `UNRWLY-${order.id.substring(0,6)}`,
      line_items: printifyLineItems,
      shipping_method: 1, // Standard
      address_to: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        country: address.country,
        region: address.region,
        city: address.city,
        address1: address.address1,
        address2: address.address2,
        zip: address.zip
      }
    };

    const res = await fetch(`https://api.printify.com/v1/shops/${shopId}/orders.json`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(printifyPayload)
    });

    if (res.ok) {
      const pOrder = await res.json();
      await prisma.order.update({
        where: { id: order.id },
        data: {
          printifyOrderId: pOrder.id,
          status: "PROCESSING",
          internalNotes: (order.internalNotes || "") + `\n[SYSTEM]: MONEY: VERIFIED // PRODUCTION: TRIGGERED (ID: ${pOrder.id})`
        }
      });
      return { success: true, printifyOrderId: pOrder.id };
    } else {
      const errBody = await res.text();
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "MANUAL_INTERVENTION_REQUIRED",
          internalNotes: (order.internalNotes || "") + `\n[SYSTEM]: PRODUCTION_FAILURE: ${errBody}`
        }
      });
      return { success: false, error: errBody };
    }
  } catch (err) {
    console.error("Printify Bridge Error:", err);
    return { success: false, error: "NETWORK_FAILURE" };
  }
}

/**
 * Programmatically registers the Unrwly webhook endpoint with Printify.
 * Ensures the factory has a persistent link to propagate shipment data.
 */
export async function registerPrintifyWebhook(targetUrl: string) {
  const shopId = process.env.PRINTIFY_SHOP_ID;
  const token = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_TOKEN;

  if (!shopId || !token) {
    return { success: false, error: "CREDENTIALS_MISSING" };
  }

  try {
    // 1. Check for existing webhooks to prevent duplicate noise
    const existingRes = await fetch(`https://api.printify.com/v1/shops/${shopId}/webhooks.json`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    if (existingRes.ok) {
      const webhooks = await existingRes.json();
      const duplicate = webhooks.find((w: any) => w.url === targetUrl);
      if (duplicate) {
        return {
          success: true,
          message: "WEBHOOK_ALREADY_REGISTERED",
          id: duplicate.id,
          // Needed for PRINTIFY_WEBHOOK_SECRET (signature verification)
          secret: duplicate.secret as string | undefined,
        };
      }
    }

    // 2. Register the new autonomous listener
    const payload = {
      topic: "order:shipment:created", // Primary event for Logistics Mastery
      url: targetUrl
    };

    const res = await fetch(`https://api.printify.com/v1/shops/${shopId}/webhooks.json`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`[PRINTIFY] Webhook Registered successfully: ${targetUrl}`);
      
      // Also register for delivery if possible (optional but good for 'Live Status' objective)
      await fetch(`https://api.printify.com/v1/shops/${shopId}/webhooks.json`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "order:shipment:delivered", url: targetUrl })
      });

      // Printify returns the signing secret on creation — it's needed for
      // PRINTIFY_WEBHOOK_SECRET so incoming events can be verified.
      if (data.secret) {
        console.log("[PRINTIFY] Webhook secret (set as PRINTIFY_WEBHOOK_SECRET):", data.secret);
      }

      return { success: true, id: data.id, secret: data.secret as string | undefined };
    } else {
      const error = await res.text();
      return { success: false, error };
    }
  } catch (err) {
    console.error("registerPrintifyWebhook Error:", err);
    return { success: false, error: "NETWORK_FAILURE" };
  }
}

// =====================================================================
//  DESIGN STUDIO — Programmatic product creation (Printify Catalog API)
//  Lets Unrwly create designed products in-house, without opening Printify.
// =====================================================================

const PRINTIFY_BASE = "https://api.printify.com/v1";

function printifyAuth() {
  const shopId = process.env.PRINTIFY_SHOP_ID;
  const token = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_TOKEN;
  if (!shopId || !token) return null;
  return { shopId, token, headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } };
}

export interface BlueprintSummary {
  id: number;
  title: string;
  brand: string;
  image: string;
}

/**
 * Lists product "blueprints" (T-shirts, hoodies, mugs, etc.) available on Printify.
 * Filtered to popular, easy-to-design categories to keep the picker clean.
 */
export async function getPrintifyBlueprints(): Promise<BlueprintSummary[] | null> {
  const auth = printifyAuth();
  if (!auth) return null;

  try {
    const res = await fetch(`${PRINTIFY_BASE}/catalog/blueprints.json`, { headers: auth.headers });
    if (!res.ok) return null;
    const data: any[] = await res.json();

    const POPULAR = /(t-?shirt|hoodie|sweatshirt|tank|mug|tote|poster|canvas|sticker|phone case|hat|cap|beanie|pillow|towel|blanket|bag)/i;
    return data
      .filter((b) => POPULAR.test(b.title))
      .map((b) => ({
        id: b.id,
        title: b.title,
        brand: b.brand || "",
        image: b.images?.[0] || "",
      }));
  } catch (err) {
    console.error("getPrintifyBlueprints Error:", err);
    return null;
  }
}

/**
 * Resolves the default print provider + variants + print position for a blueprint.
 * Picks the first available provider (keeps the studio a one-click flow).
 */
export async function getBlueprintSetup(blueprintId: number) {
  const auth = printifyAuth();
  if (!auth) return null;

  try {
    const provRes = await fetch(
      `${PRINTIFY_BASE}/catalog/blueprints/${blueprintId}/print_providers.json`,
      { headers: auth.headers }
    );
    if (!provRes.ok) return null;
    const providers: any[] = await provRes.json();
    const provider = providers[0];
    if (!provider) return null;

    const varRes = await fetch(
      `${PRINTIFY_BASE}/catalog/blueprints/${blueprintId}/print_providers/${provider.id}/variants.json`,
      { headers: auth.headers }
    );
    if (!varRes.ok) return null;
    const varData = await varRes.json();
    const variants: any[] = varData.variants || [];

    const rawPlaceholders = variants[0]?.placeholders || [];
    const frontPlaceholder =
      rawPlaceholders.find((p: any) => /front/i.test(p.position)) || rawPlaceholders[0];
    const frontPosition = frontPlaceholder?.position || "front";

    // All available print positions (front, back, sleeves, neck label...)
    const placeholders = rawPlaceholders.map((p: any) => ({
      position: p.position,
      width: p.width || 1000,
      height: p.height || 1000,
    }));

    // Variant details (color/size) for the picker
    const variantDetails = variants.map((v) => ({
      id: v.id as number,
      color: (v.options?.color as string) || "",
      size: (v.options?.size as string) || "",
    }));

    return {
      providerId: provider.id,
      providerTitle: provider.title,
      variantIds: variants.map((v) => v.id),
      variantDetails,
      variantCount: variants.length,
      frontPosition,
      placeholders,
      printArea: {
        width: frontPlaceholder?.width || 1000,
        height: frontPlaceholder?.height || 1000,
      },
    };
  } catch (err) {
    console.error("getBlueprintSetup Error:", err);
    return null;
  }
}

/**
 * Uploads an artwork image to Printify — either by public URL or by raw base64
 * `contents` (no external storage needed). Returns Printify's image id.
 */
export async function uploadArtworkToPrintify(
  image: { url?: string; contents?: string },
  fileName = "unrwly-design.png"
) {
  const auth = printifyAuth();
  if (!auth) return null;

  const body = image.url
    ? { file_name: fileName, url: image.url }
    : { file_name: fileName, contents: image.contents };

  try {
    const res = await fetch(`${PRINTIFY_BASE}/uploads/images.json`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("uploadArtworkToPrintify failed:", await res.text());
      return null;
    }
    return await res.json(); // { id, file_name, width, height, preview_url }
  } catch (err) {
    console.error("uploadArtworkToPrintify Error:", err);
    return null;
  }
}

export interface DesignPlacement {
  x: number;     // 0..1 horizontal center
  y: number;     // 0..1 vertical center
  scale: number; // relative size
  angle: number; // degrees
}

/** One designed side: an already-uploaded Printify image id + its position. */
export interface DesignSide {
  position: string;
  imageId: string;
  placement?: DesignPlacement;
}

/**
 * Creates a designed product on Printify: places uploaded artwork onto one or
 * more print positions (front, back, sleeves...). Printify auto-generates mockups.
 */
export async function createDesignedPrintifyProduct(params: {
  blueprintId: number;
  providerId: number;
  variantIds: number[];
  sides: DesignSide[];
  title: string;
  description: string;
  priceCents: number;
}) {
  const auth = printifyAuth();
  if (!auth) return { success: false as const, error: "CREDENTIALS_MISSING" };

  try {
    const payload = {
      title: params.title,
      description: params.description,
      blueprint_id: params.blueprintId,
      print_provider_id: params.providerId,
      variants: params.variantIds.map((id) => ({
        id,
        price: params.priceCents,
        is_enabled: true,
      })),
      print_areas: [
        {
          variant_ids: params.variantIds,
          placeholders: params.sides.map((s) => ({
            position: s.position,
            images: [
              {
                id: s.imageId,
                x: s.placement?.x ?? 0.5,
                y: s.placement?.y ?? 0.5,
                scale: s.placement?.scale ?? 1,
                angle: s.placement?.angle ?? 0,
              },
            ],
          })),
        },
      ],
    };

    const res = await fetch(`${PRINTIFY_BASE}/shops/${auth.shopId}/products.json`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { success: false as const, error: await res.text() };
    }

    const product = await res.json();
    const images: any[] = product.images || [];
    const mockup = images.find((i) => i.is_default) || images[0];

    // Collect a gallery of distinct mockup angles (one per camera position)
    const seen = new Set<string>();
    const mockups: string[] = [];
    for (const img of images) {
      const key = img.position || img.src;
      if (seen.has(key)) continue;
      seen.add(key);
      if (img.src) mockups.push(img.src);
      if (mockups.length >= 8) break;
    }

    const baseCost = product.variants?.[0]?.cost ? product.variants[0].cost / 100 : 0;

    return {
      success: true as const,
      product,
      printifyId: product.id as string,
      mockupUrl: (mockup?.src as string) || "",
      mockups,
      baseCost,
    };
  } catch (err) {
    console.error("createDesignedPrintifyProduct Error:", err);
    return { success: false as const, error: "NETWORK_FAILURE" };
  }
}

/**
 * One Source of Truth: Synchronizes the local database with the Printify shop.
 * Handles fetching, model mapping, meta-description generation, and persistence.
 */
export async function syncStorefrontWithPrintify() {
  try {
    const { products: liveProducts, complete } = await fetchPrintifyCatalog();

    if (liveProducts === null) {
      return { success: false, error: "PRINTIFY_AUTH_FAILED" };
    }

    const currentProductCount = await prisma.product.count();
    const isFullRestore = currentProductCount === 0;

    if (isFullRestore) {
      console.log("⚠️ IMMORTALITY PROTOCOL: Initiating Full Restore...");
      const defaultCollections = ["New Arrivals", "Best Sellers"];
      for (const name of defaultCollections) {
         const handle = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
         await prisma.collection.upsert({
            where: { handle },
            update: {},
            create: { name, handle }
         });
      }
    }

    let syncCount = 0;
    for (const p of liveProducts) {
      const description = p.descriptionHtml || p.description || "";
      // Strip HTML and truncate for meta description
      const metaDescription = description.replace(/<[^>]*>?/gm, '').substring(0, 157).trim() + "...";

      await prisma.product.upsert({
        where: { printifyId: p._id },
        update: {
          name: p.name,
          description: description,
          metaDescription: metaDescription,
          imageUrl: p.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80", 
          cost: p.rawPrice,
        },
        create: {
          printifyId: p._id,
          name: p.name,
          description: description,
          metaDescription: metaDescription,
          price: p.rawPrice * 2,
          cost: p.rawPrice,
          imageUrl: p.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
          status: "DRAFT",
          // Set once, on first sync, from the shop the product came out of.
          // Deliberately absent from the `update` branch above: once a product
          // exists, whatever an admin chose in the panel is the truth, and a
          // re-sync must not overwrite it.
          audience: audienceForShop(p.shopId),
        }
      });
      syncCount++;
    }

    // A product deleted from Printify can no longer be fulfilled, and its
    // mockup URL dies with it — images.printify.com answers 400 "Product not
    // found", and the retired S3 mockup bucket answers 403. Left LIVE, those
    // rows render as broken images on the storefront and would take orders
    // that Printify then refuses. Demote them to DRAFT so they drop out of the
    // storefront queries, which all filter on status: 'LIVE'.
    //
    // Only safe on a complete catalogue read: a partial one (rate limit, a
    // shop erroring mid-pagination) would draft the entire store.
    let draftedCount = 0;
    if (complete && liveProducts.length > 0) {
      const { count } = await prisma.product.updateMany({
        where: {
          status: "LIVE",
          printifyId: { notIn: liveProducts.map((p) => p._id) },
        },
        data: { status: "DRAFT" },
      });
      draftedCount = count;
      if (count > 0) {
        console.log(`[SYNC] Drafted ${count} product(s) no longer present in Printify.`);
      }
    }

    return { 
      success: true, 
      count: syncCount, 
      draftedCount,
      partial: !complete,
      isFullRestore 
    };
  } catch (err) {
    console.error("syncStorefrontWithPrintify Error:", err);
    return { success: false, error: "INTERNAL_SYNC_ERROR" };
  }
}
