import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return new NextResponse("Session ID is required", { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const order = await prisma.order.findFirst({
        where: { stripeSessionId: sessionId },
        select: { orderNumber: true, id: true }
      });

      return NextResponse.json({
        success: true,
        orderNumber: order?.orderNumber || "Pending",
        orderId: order?.id
      });
    }

    return NextResponse.json({ success: false, status: session.payment_status });

  } catch (error) {
    console.error("VERIFY ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
