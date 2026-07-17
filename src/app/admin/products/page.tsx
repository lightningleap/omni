import { prisma } from "@/lib/prisma"
import ProductsClient from "@/components/admin/ProductsClient"

export default async function ProductsPage() {
  const rawProducts = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      price: true,
      cost: true,
      imageUrl: true,
      collectionId: true,
      status: true,
      source: true,
    }
  })

  const rawCollections = await prisma.collection.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" }
  })

  return (
    <div className="space-y-8 font-mono max-w-[1400px] mx-auto w-full">
      <ProductsClient initialProducts={rawProducts} collections={rawCollections} />
    </div>
  )
}
