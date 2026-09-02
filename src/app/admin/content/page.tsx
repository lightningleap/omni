import { prisma } from "@/lib/prisma"
import MerchClient from "@/components/admin/MerchClient"

export default async function ContentPage() {
  const [config, lookbookImages, collections, discoveryItems] = await Promise.all([
    prisma.storeConfig.findUnique({ where: { id: "global" } }),
    prisma.lookbookImage.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.collection.findMany({ orderBy: { name: "asc" } }),
    prisma.discoveryItem.findMany({ include: { collection: true }, orderBy: { order: "asc" } })
  ])

  return (
    <div className="w-full">
      <MerchClient 
        initialConfig={config} 
        initialImages={lookbookImages} 
        collections={collections} 
        initialDiscovery={discoveryItems}
      />
    </div>
  )
}
