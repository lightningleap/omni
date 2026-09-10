import { prisma } from "@/lib/prisma"
import ProductsClient from "@/components/admin/ProductsClient"
import { ADMIN_SHELL } from "@/components/admin/ui/primitives"

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
    <div className={`${ADMIN_SHELL} space-y-8`}>
      <ProductsClient initialProducts={rawProducts} collections={rawCollections} />
    </div>
  )
}
