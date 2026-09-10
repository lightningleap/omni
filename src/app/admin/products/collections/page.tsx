import { prisma } from "@/lib/prisma"
import CollectionsClient from "@/components/admin/CollectionsClient"
import { ADMIN_SHELL } from "@/components/admin/ui/primitives"

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
  // `imageUrl` was already being fetched and dropped here: the query above
  // has no `select`, so every scalar on the row is in memory, and five of the
  // six were being mapped across. The card view shows the collection's image,
  // so the sixth crosses too. No extra query and no extra round trip.
  const formattedCollections = collections.map(col => ({
    id: col.id,
    name: col.name,
    description: col.description,
    handle: col.handle,
    imageUrl: col.imageUrl,
    productCount: col._count.products
  }))

  return (
    <div className={ADMIN_SHELL}>
      <CollectionsClient initialCollections={formattedCollections} />
    </div>
  )
}
