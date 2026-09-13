import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Confirms to the success page that a payment really went through.
 *
 * Accepts either identifier:
 *   ?payment_intent=pi_…   the embedded flow (current)
 *   ?session_id=cs_…       the hosted Checkout flow (kept for older links)
 *
 * The status always comes from Stripe, never from the query string — a shopper
 * cannot reach a "paid" screen by editing the URL, because the id is looked up
 * against Stripe and its own status is what decides the answer.
 *
 * This does NOT fulfil the order. Fulfilment happens in the webhook, from a
 * signed event; this endpoint only reads. That separation is deliberate: a
 * shopper who closes the tab before the redirect still gets their order, and a
 * page refresh here can never double-fulfil one.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentIntentId = searchParams.get('payment_intent');
    const sessionId = searchParams.get('session_id');

    if (!paymentIntentId && !sessionId) {
      return new NextResponse('A payment_intent or session_id is required', { status: 400 });
    }

    // ── Embedded flow ────────────────────────────────────────────────────
    if (paymentIntentId) {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (intent.status === 'succeeded') {
        const order = await prisma.order.findFirst({
          where: { stripePaymentIntentId: paymentIntentId },
          select: { orderNumber: true, id: true },
        });

        return NextResponse.json({
          success: true,
          // "Pending" when the webhook has not landed yet — the payment is real
          // either way, and the number appears on refresh.
          orderNumber: order?.orderNumber || 'Pending',
          orderId: order?.id,
        });
      }

      return NextResponse.json({ success: false, status: intent.status });
    }

    // ── Hosted flow (legacy links) ───────────────────────────────────────
    const session = await stripe.checkout.sessions.retrieve(sessionId!);

    if (session.payment_status === 'paid') {
      const order = await prisma.order.findFirst({
        where: { stripeSessionId: sessionId! },
        select: { orderNumber: true, id: true },
      });

      return NextResponse.json({
        success: true,
        orderNumber: order?.orderNumber || 'Pending',
        orderId: order?.id,
      });
    }

    return NextResponse.json({ success: false, status: session.payment_status });
  } catch (error) {
    console.error('VERIFY ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
