import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return new NextResponse("Cart is empty", { status: 400 });
    }

    // ==========================================================
    // TRUST BOUNDARY — never trust prices sent by the browser.
    // Only the product id, quantity and variant come from the client;
    // every price/name/image is re-read from the database below.
    // ==========================================================
    const MAX_QTY = 25;
    const requested = items
      .map((i: any) => ({
        productId: String(i.productId || i.id || ""),
        quantity: Math.floor(Number(i.quantity)),
        variantId: i.variantId ?? null,
      }))
      .filter((i) => i.productId);

    if (requested.length === 0) {
      return new NextResponse("Invalid cart", { status: 400 });
    }
    if (requested.some((i) => !Number.isFinite(i.quantity) || i.quantity < 1 || i.quantity > MAX_QTY)) {
      return new NextResponse(`Quantity must be between 1 and ${MAX_QTY}.`, { status: 400 });
    }

    const dbProducts = await prisma.product.findMany({
      where: { id: { in: requested.map((i) => i.productId) } },
      select: { id: true, name: true, price: true, imageUrl: true, status: true },
    });
    const byId = new Map(dbProducts.map((p) => [p.id, p]));

    // Re-price every line from the DB; reject anything unavailable
    const priced = [];
    for (const r of requested) {
      const p = byId.get(r.productId);
      if (!p) {
        return new NextResponse("A product in your cart is no longer available.", { status: 400 });
      }
      if (p.status !== "LIVE") {
        return new NextResponse(`"${p.name}" is not available for purchase.`, { status: 400 });
      }
      if (!Number.isFinite(p.price) || p.price <= 0) {
        return new NextResponse(`"${p.name}" is not priced correctly.`, { status: 400 });
      }
      priced.push({ product: p, quantity: r.quantity, variantId: r.variantId });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    // ==========================================
    // ADVANCED GA4 COOKIE EXTRACTION
    // ==========================================
    const measurementId = process.env.NEXT_PUBLIC_GA_ID?.replace('G-', '');
    const gaCookie = cookieStore.get('_ga')?.value;
    const sessionCookie = measurementId ? cookieStore.get(`_ga_${measurementId}`)?.value : null;

    let gaClientId = '';
    let gaSessionId = '';

    if (gaCookie) {
      // Extracts XXXXXX.YYYYYY from GA1.1.XXXXXX.YYYYYY
      gaClientId = gaCookie.split('.').slice(-2).join('.');
    }

    if (sessionCookie) {
      // Extracts the 3rd part of the session cookie (the actual Session ID)
      const parts = sessionCookie.split('.');
      gaSessionId = parts[2];
    }
    // ==========================================

    const dbUser = user ? await prisma.user.findUnique({ where: { email: user.email } }) : null;
    const totalAmount = priced.reduce((total, { product, quantity }) => total + product.price * quantity, 0);
    const orderNumber = `UNR-${Math.random().toString(36).toUpperCase().substring(2, 10)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: dbUser?.id || null,
        status: 'PENDING',
        totalAmount,
        items: {
          create: priced.map(({ product, quantity, variantId }) => ({
            productId: product.id,
            quantity,
            price: product.price,
            variantId: variantId || null,
          })),
        },
      },
    });

    // ── PAYMENT INTENT, NOT A HOSTED CHECKOUT SESSION ──────────────────────
    // The checkout is now embedded: contact, address and payment are collected
    // on our own page by Stripe's Address and Payment Elements, and the card
    // fields are Stripe-hosted iframes, so no card data ever touches this
    // origin and the PCI position is unchanged from the hosted flow.
    //
    // The amount is the SERVER's total, computed from `priced` above — the same
    // trust boundary the hosted flow had. The browser sends product ids and
    // quantities and nothing else that can move money.
    //
    // `automatic_payment_methods` lets Stripe decide which methods to offer for
    // the shopper's region from the dashboard configuration, rather than this
    // file hardcoding `['card']` and silently excluding wallets that are
    // already enabled on the account.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      receipt_email: user?.email || undefined,
      // `orderId` is what the webhook fulfils against. It is the single link
      // between Stripe's record and ours, exactly as it was on the session.
      metadata: {
        orderId: order.id,
        ga_client_id: gaClientId,
        ga_session_id: gaSessionId,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      // Returned so the client can show the server's total rather than its own
      // arithmetic — if the two ever disagree, the server's figure is the one
      // being charged and the one the shopper should see.
      amount: totalAmount,
    });

  } catch (error) {
    console.error("STRIPE ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
