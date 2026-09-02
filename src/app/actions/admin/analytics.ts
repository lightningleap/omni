"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth";

export async function getFinancialSummary() {
  await requireAdmin()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const paidOrders = await prisma.order.findMany({
    where: {
      status: { in: ["PAID", "PROCESSING", "SHIPPED"] },
      createdAt: { gte: thirtyDaysAgo }
    },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "asc" }
  })

  let grossRevenue = 0
  let productionCost = 0
  const dailyData: Record<string, { date: string; revenue: number; orders: number }> = {}

  paidOrders.forEach(order => {
    grossRevenue += order.totalAmount
    const dateKey = order.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    if (!dailyData[dateKey]) dailyData[dateKey] = { date: dateKey, revenue: 0, orders: 0 }
    dailyData[dateKey].revenue += order.totalAmount
    dailyData[dateKey].orders += 1
    order.items.forEach((item: any) => {
      productionCost += (item.product.cost || 0) * item.quantity
    })
  })

  const stripeFeeEstimator = (grossRevenue * 0.029) + (paidOrders.length * 0.30)
  const netProfit = grossRevenue - productionCost - stripeFeeEstimator
  const allTimeTotal = await prisma.order.aggregate({
    where: { status: { in: ["PAID", "PROCESSING", "SHIPPED"] } },
    _sum: { totalAmount: true }
  })

  return {
    grossRevenue, productionCost, stripeFeeEstimate: stripeFeeEstimator,
    netProfit, graphData: Object.values(dailyData),
    liveTickerTotal: allTimeTotal._sum.totalAmount || 0
  }
}

export async function getUnitEconomics() {
  await requireAdmin()
  const products = await prisma.product.findMany({
    include: {
      orderItems: { where: { order: { status: { in: ["PAID", "PROCESSING", "SHIPPED"] } } } }
    }
  })

  const unitEconomics = products.map(product => {
    const cost = product.cost || 0
    const price = product.price || 0
    const marginAmount = price - cost
    const unitsSold = product.orderItems.reduce((acc, item) => acc + item.quantity, 0)

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      price,
      cost,
      marginPercent: price > 0 ? (marginAmount / price) * 100 : 0,
      unitsSold,
      totalProfitGenerated: unitsSold * marginAmount,
      // FIX: Added isAssigned as required by UnitData type in FinanceClient
      isAssigned: !!product.collectionId,
      status: product.collectionId ? "ACTIVE" : "DRAFT"
    }
  }).sort((a, b) => b.totalProfitGenerated - a.totalProfitGenerated)

  return { unitEconomics }
}
