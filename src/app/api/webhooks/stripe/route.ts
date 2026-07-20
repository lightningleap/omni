import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"
import { createPrintifyOrder } from "@/lib/printify"
import { sendEmail, orderConfirmationEmail } from "@/lib/email"
import crypto from "crypto"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16" as any
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  const payloadStr = await req.text()
  const signature = req.headers.get("stripe-signature")

  let event;

  if (endpointSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(payloadStr, signature, endpointSecret)
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: "Webhook Error" }, { status: 400 })
    }
  } else {
    event = JSON.parse(payloadStr)
  }

  async function fulfillOrder(orderId: string, stripeObject: any) {
    console.log(`[FULFILLMENT] Processing Order: ${orderId}`);

    const existingOrder = await prisma.order.findUnique({
      where: { stripeSessionId: stripeObject.id },
      include: { user: true }
    });

    if (existingOrder && existingOrder.status !== "PENDING") return;

    // 1. Gather Data
    const addressDetails = stripeObject.shipping_details?.address || stripeObject.shipping?.address;
    const customerName = stripeObject.shipping_details?.name || stripeObject.customer_details?.name;
    const customerEmail = stripeObject.customer_details?.email || stripeObject.receipt_email;
    const formattedAddress = addressDetails ? `${addressDetails.line1}, ${addressDetails.city}, ${addressDetails.state} ${addressDetails.postal_code}` : "N/A";

    const orderWithItems = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } }, user: true }
    });

    if (!orderWithItems) return;

    const amountPaid = (stripeObject.amount_total || 0) / 100;
    const profit = amountPaid - orderWithItems.items.reduce((sum, i) => sum + (i.product.cost || 0) * i.quantity, 0);

    // 2. Update DB
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        stripeSessionId: stripeObject.id,
        profit,
        totalPaid: amountPaid,
        shippingAddress: `${customerName} | ${customerEmail} | ${formattedAddress}`,
        ...(orderWithItems.userId && {
          user: { update: { totalSpent: { increment: amountPaid } } }
        })
      }
    });

    // 3. Printify Handoff
    await createPrintifyOrder(orderId, stripeObject);

    // 3b. Order confirmation email to the customer
    if (customerEmail) {
      try {
        await sendEmail({
          to: customerEmail,
          subject: `Your UNRWLY order is confirmed`,
          html: orderConfirmationEmail({
            customerName,
            orderId,
            amountPaid,
            currency: (stripeObject.currency || "usd").toUpperCase(),
            items: orderWithItems.items.map((i) => ({
              name: i.product?.name || "Product",
              quantity: i.quantity,
              price: i.price,
            })),
          }),
        });
      } catch (e) {
        console.error("[EMAIL WEBHOOK ERROR]", e);
      }
    }

    // ==========================================
    // 4. GA4 SERVER-SIDE MEASUREMENT (STITCHED)
    // ==========================================
    try {
      const measurementId = process.env.NEXT_PUBLIC_GA_ID;
      const apiSecret = process.env.GA_API_SECRET;

      if (measurementId && apiSecret) {
        const gaItems = orderWithItems.items.map(item => ({
          item_id: item.productId,
          item_name: item.product?.name || "Product",
          price: item.price,
          quantity: item.quantity
        }));

        const clientId = stripeObject.metadata?.ga_client_id || orderWithItems.userId || crypto.randomUUID();
        const sessionId = stripeObject.metadata?.ga_session_id;

        const newLtv = (orderWithItems.user?.totalSpent || 0) + amountPaid;

        // Toggle endpoint based on environment for testing
        const isDebug = process.env.NODE_ENV === 'development';
        const gaEndpoint = isDebug ? 'debug/mp/collect' : 'mp/collect';

        const payload = {
          client_id: clientId,
          user_id: orderWithItems.userId || undefined,
          user_properties: {
            customer_tier: { value: newLtv > 500 ? "platinum" : newLtv > 100 ? "gold" : "standard" },
            total_ltv: { value: newLtv.toFixed(2) }
          },
          events: [{
            name: 'purchase',
            params: {
              currency: (stripeObject.currency || "usd").toUpperCase(),
              value: amountPaid,
              transaction_id: orderId,
              session_id: sessionId, // Ties purchase to the marketing source
              engagement_time_msec: 1500,
              debug_mode: isDebug ? 1 : undefined,
              items: gaItems
            }
          }]
        };

        await fetch(`https://www.google-analytics.com/${gaEndpoint}?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
    } catch (e) { console.error("[GA4 WEBHOOK ERROR]", e); }
  }

  // --- STRIPE HANDLERS ---
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, { expand: ["line_items", "customer"] }) as any;
    if (fullSession.metadata?.orderId) await fulfillOrder(fullSession.metadata.orderId, fullSession);
  }

  return NextResponse.json({ received: true });
}
