import { prisma } from "@/lib/prisma"
import OrdersClient from "@/components/admin/OrdersClient"

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true }
      },
      items: {
        include: { product: true }
      }
    }
  })

  // Format data for client boundary safely
  const safeOrders = orders.map(o => ({
    id: o.id,
    createdAt: o.createdAt,
    user: o.user,
    status: o.status,
    totalAmount: Number(o.totalAmount),
    totalPaid: o.totalPaid ? Number(o.totalPaid) : null,
    printifyOrderId: o.printifyOrderId,
    trackingNumber: o.trackingNumber,
    shippingAddress: o.shippingAddress,
    items: o.items.map(item => ({
      id: item.id,
      name: item.product.name,
      price: Number(item.price),
      quantity: item.quantity,
      variantId: item.variantId
    }))
  }))

  return (
    <div className="space-y-8 font-sans max-w-[1400px] mx-auto w-full">
      <OrdersClient initialOrders={safeOrders} />
    </div>
  )
}
