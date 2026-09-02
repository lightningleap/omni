import { prisma } from "@/lib/prisma"
import CollectionsClient from "@/components/admin/CollectionsClient"

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { products: true }
      }
    }
  })

  // Normalize data for the Client Component
  const formattedCollections = collections.map(col => ({
    id: col.id,
    name: col.name,
    description: col.description,
    handle: col.handle,
    productCount: col._count.products
  }))

  return (
    <div className="w-full">
      <CollectionsClient initialCollections={formattedCollections} />
    </div>
  )
}
