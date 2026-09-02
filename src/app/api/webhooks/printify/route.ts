import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

// Used by Printify to validate the webhook endpoint presence
export async function GET() {
  return new Response("OK", { status: 200 })
}

export async function HEAD() {
  return new Response(null, { status: 200 })
}

/**
 * Verifies Printify's HMAC-SHA256 signature over the raw request body.
 * Printify sends `X-Pfy-Signature: sha256=<hex>` signed with the webhook secret
 * returned when the webhook was registered.
 */
function verifyPrintifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex")
  const given = Buffer.from(signature)
  const want = Buffer.from(expected)
  // Length check first — timingSafeEqual throws on length mismatch
  if (given.length !== want.length) return false
  return crypto.timingSafeEqual(given, want)
}


export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-pfy-signature") || req.headers.get("x-printify-signature")
    
    // Parse body safely
    let body;
    try {
      body = rawBody ? JSON.parse(rawBody) : null
    } catch (e) {
      console.warn("Incoming request is not JSON (might be a validation ping):", rawBody)
      return new Response("OK", { status: 200 }) // Return 200 to satisfy pings
    }

    if (!body) {
      return new Response("OK", { status: 200 })
    }

    // ==========================================================
    // SIGNATURE VERIFICATION — this endpoint mutates order state,
    // so a forged payload could fake "shipped"/"delivered".
    // Anything past this point must be provably from Printify.
    // ==========================================================
    const secret = process.env.PRINTIFY_WEBHOOK_SECRET
    if (secret) {
      if (!verifyPrintifySignature(rawBody, signature, secret)) {
        console.warn("[PRINTIFY WEBHOOK] Rejected — invalid or missing signature")
        return new Response("Invalid signature", { status: 401 })
      }
    } else if (process.env.NODE_ENV === "production") {
      // Fail closed in production rather than trusting unsigned events.
      console.error("[PRINTIFY WEBHOOK] PRINTIFY_WEBHOOK_SECRET is not set — rejecting event")
      return new Response("Webhook secret not configured", { status: 500 })
    } else {
      console.warn("[PRINTIFY WEBHOOK] No PRINTIFY_WEBHOOK_SECRET set — signature unverified (dev only)")
    }

    // Gatekeeper: Only parse product publishes.
    if (body.type === "shop:product:published" || body.type === "product:published" || body.type === "product:updated") {
      const printifyId = body.resource?.id || body.id;
      if (!printifyId) {
        console.error("No product ID found in webhook body:", body);
        return NextResponse.json({ error: "MISSING_ID" }, { status: 400 });
      }

      // Fetch full product details from Printify API to ensure we have images, variants, etc.
      const shopId = process.env.PRINTIFY_SHOP_ID;
      const token = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_TOKEN;
      
      const response = await fetch(`https://api.printify.com/v1/shops/${shopId}/products/${printifyId}.json`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
        console.error(`Failed to fetch full product data for ${printifyId}: ${response.statusText}`);
        return NextResponse.json({ error: "FETCH_FAILED" }, { status: 500 });
      }

      const product = await response.json();
      const name = product.title || "UNKNOWN PRODUCT"
      const description = product.description || ""
      
      // SEO Auto-Gen: Strip HTML and truncate for meta description
      const metaDescription = description.replace(/<[^>]*>?/gm, '').substring(0, 157).trim() + "...";

      // Extract the primary image URL
      const imageUrl = product.images && product.images.length > 0 
        ? product.images[0].src 
        : "https://via.placeholder.com/400x500"
      
      // Extract baseline cost from the first variant and convert from cents
      const baseCost = product.variants && product.variants.length > 0 
        ? product.variants[0].cost / 100 
        : 0

      // Secure Upsert: Defaults to DRAFT mode in the Holding Pen
      await prisma.product.upsert({
        where: { printifyId },
        update: {
          name,
          description,
          metaDescription,
          imageUrl,
          cost: baseCost,
        },
        create: {
          printifyId,
          name,
          description,
          metaDescription,
          price: baseCost * 2, // Arbitrary markup fallback
          cost: baseCost,
          imageUrl,
        }
      })

      // INSTANT CACHE REVALIDATION
      revalidatePath("/admin/products")
      revalidatePath("/collections")
      revalidatePath("/")

      console.log(`\x1b[42m\x1b[30m SUCCESS \x1b[0m \x1b[32mPRODUCT SYNCED (VIA WEBHOOK):\x1b[0m ${name}`);
      return NextResponse.json({ acknowledged: true })
    }

    // 2. LOGISTICS HANDLER: Shipped
    if (body.type === "order:shipped" || body.type === "order:shipment:created") {
      const resource = body.resource;
      // order:shipped has 'id', order:shipment:created has 'order_id'
      const printifyOrderId = resource.order_id || resource.id;
      const tracking = resource.tracking_number || resource.shipments?.[0]?.number || "UNKNOWN";
      const carrier = resource.carrier || resource.shipments?.[0]?.carrier || "UNKNOWN";
      const trackingUrl = resource.tracking_url || resource.shipments?.[0]?.url || null;

      if (!printifyOrderId) return NextResponse.json({ error: "MISSING_ORDER_ID" }, { status: 400 });

      await prisma.order.update({
        where: { printifyOrderId },
        data: {
          status: "SHIPPED",
          trackingNumber: tracking,
          carrier: carrier,
          trackingUrl: trackingUrl,
          internalNotes: {
            set: (await prisma.order.findUnique({ where: { printifyOrderId } }))?.internalNotes + 
                 `\n[LOGISTICS]: DISPATCHED VIA ${carrier.toUpperCase()} AT ${new Date().toLocaleTimeString()}. TRACKING: ${tracking}`
          }
        }
      });
      
      revalidatePath("/admin/orders");
      console.log(`\x1b[46m\x1b[30m LOGISTICS \x1b[0m \x1b[36mORDER SHIPPED:\x1b[0m ${printifyOrderId}`);
      return NextResponse.json({ acknowledged: true });
    }

    // 3. LOGISTICS HANDLER: Delivered
    if (body.type === "order:delivered" || body.type === "order:shipment:delivered") {
      const resource = body.resource;
      const printifyOrderId = resource.order_id || resource.id;

      if (!printifyOrderId) return NextResponse.json({ error: "MISSING_ORDER_ID" }, { status: 400 });

      await prisma.order.update({
        where: { printifyOrderId },
        data: {
          status: "DELIVERED",
          internalNotes: {
            set: (await prisma.order.findUnique({ where: { printifyOrderId } }))?.internalNotes + 
                 `\n[LOGISTICS]: CONFIRMED DELIVERY AT ${new Date().toLocaleTimeString()}.`
          }
        }
      });
      revalidatePath("/admin/orders");
      console.log(`\x1b[42m\x1b[30m LOGISTICS \x1b[0m \x1b[32mORDER DELIVERED:\x1b[0m ${printifyOrderId}`);
      return NextResponse.json({ acknowledged: true });
    }

    return NextResponse.json({ ignored: true })
    
  } catch (error) {
    console.error("Printify Webhook Error:", error)
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 })
  }
}
