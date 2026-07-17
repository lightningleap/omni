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

    // Built entirely from DB-verified products — client prices are ignored
    const lineItems = priced.map(({ product, quantity, variantId }) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name,
          ...(product.imageUrl?.startsWith('http') ? { images: [product.imageUrl] } : {}),
          metadata: { variantId: variantId ? String(variantId) : '' },
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity,
    }));

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

    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=1`,
      customer_email: user?.email || undefined,
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'IN', 'GB'] },
      metadata: {
        orderId: order.id,
        ga_client_id: gaClientId,
        ga_session_id: gaSessionId
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id }
    });

    return NextResponse.json({ url: stripeSession.url });

  } catch (error) {
    console.error("STRIPE ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
