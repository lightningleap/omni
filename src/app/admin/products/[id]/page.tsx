import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ProductEditorClient from "@/components/admin/ProductEditorClient"
import { fetchPrintifyMockups } from "@/lib/printify"
import { ADMIN_SHELL } from "@/components/admin/ui/primitives"

export default async function ProductEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id }
  })

  if (!product) {
    notFound()
  }

  const collections = await prisma.collection.findMany({
    orderBy: { createdAt: "desc" }
  })

  // Per-colour mockups from Printify (so all colours show on the editor)
  const mockups = product.printifyId ? await fetchPrintifyMockups(product.printifyId) : []

  // Legacy status normalization removed due to schema purge

  const productData = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price || 0,
    cost: product.cost || 0,
    imageUrl: product.imageUrl || "",
    collectionId: product.collectionId,
    printifyId: product.printifyId,
    status: product.status,
  }

  return (
    <div className={ADMIN_SHELL}>
      <ProductEditorClient product={productData} collections={collections} mockups={mockups} />
    </div>
  )
}
