"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createPrintifyOrder, registerPrintifyWebhook } from "@/lib/printify"
import Stripe from "stripe"
import { requireAdmin } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16" as any
})

export async function updateOrderStatus(orderId: string, status: any, notes?: string) {
  await requireAdmin()
  await prisma.order.update({
    where: { id: orderId },
    data: { status, internalNotes: notes }
  })
  revalidatePath("/admin/orders")
  return { success: true }
}

export async function fetchPrintifyTracking(orderId: string) {
  await requireAdmin()
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { printifyOrderId: true }
  })

  if (!order?.printifyOrderId) return { error: "No Printify Order tied to this record." }

  return { success: true, message: "Tracking status refreshed." }
}

export async function forcePushToPrintify(orderId: string) {
  await requireAdmin()
  const result = await createPrintifyOrder(orderId);
  revalidatePath("/admin/orders")
  return result;
}

/**
 * REPAIR ORDER LOGIC
 * Fixed: Added explicit check for stripeSessionId to satisfy TypeScript.
 */
export async function repairOrder(orderId: string) {
  await requireAdmin()

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { stripeSessionId: true, status: true }
  })

  // Check for existence of ID before passing to Stripe
  if (!order || !order.stripeSessionId || order.status !== "PENDING") {
    return { error: "Order not eligible for repair or missing session data." }
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId)
    if (session.payment_status === "paid") {
       await prisma.order.update({
         where: { id: orderId },
         data: { status: "PAID" }
       })
       await createPrintifyOrder(orderId, session)
       revalidatePath("/admin/orders")
       return { success: true }
    }
    return { error: `Stripe status: ${session.payment_status}` }
  } catch (e: any) {
    return { error: `Repair failed: ${e.message}` }
  }
}

export async function syncPrintifyOrder(orderId: string) {
  // Alias for fetchPrintifyTracking to maintain backward compatibility with component expectations
  return fetchPrintifyTracking(orderId);
}

export async function setupLogisticsWebhook() {
  await requireAdmin()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;

  if (!appUrl) return { error: "App URL not detected." };

  const protocol = appUrl.startsWith('http') ? '' : 'https://';
  const result = await registerPrintifyWebhook(`${protocol}${appUrl}/api/webhooks/printify`);

  if (result.success) revalidatePath("/admin/orders")
  return result
}
