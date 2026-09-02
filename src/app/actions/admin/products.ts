"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth";
import {
  syncStorefrontWithPrintify,
  getPrintifyBlueprints,
  getBlueprintSetup,
  uploadArtworkToPrintify,
  createDesignedPrintifyProduct,
  type BlueprintSummary,
} from "@/lib/printify"

export async function updateProductGatekeeper(
  productId: string,
  price: number,
  collectionId: string,
  status: "LIVE" | "DRAFT" = "DRAFT"
) {
  await requireAdmin()
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { cost: true }
  })

  if (product && product.cost && price < product.cost) {
    throw new Error(`Loss Prevention: Retail price ($${price}) cannot be lower than base cost ($${product.cost.toFixed(2)}).`)
  }

  if (status === "LIVE" && (collectionId === "none" || !collectionId)) {
    throw new Error("Gatekeeper: Product cannot be LIVE without an assigned collection.")
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      price,
      collectionId: collectionId === "none" ? null : collectionId,
      status,
    }
  })

  revalidatePath("/admin/products")
  revalidatePath("/collections")
  revalidatePath("/")
  return { success: true }
}

export async function toggleProductStatus(productId: string, isLive: boolean) {
  await requireAdmin()
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { collectionId: true }
  })

  if (isLive && !product?.collectionId) {
    throw new Error("Gatekeeper: Cannot publish. Choose a collection first.")
  }

  await prisma.product.update({
    where: { id: productId },
    data: { status: isLive ? 'LIVE' : 'DRAFT' }
  })

  revalidatePath("/admin/products")
  revalidatePath("/collections")
  revalidatePath("/")
  return { success: true }
}

export async function bulkPublishToCollection(productIds: string[], collectionId: string | null) {
  await requireAdmin()
  for (const id of productIds) {
    await prisma.product.update({
      where: { id },
      data: { collectionId: collectionId && collectionId !== "none" ? collectionId : null }
    })
  }

  revalidatePath("/admin/products")
  revalidatePath("/collections")
  revalidatePath("/")
  return { success: true }
}

export async function syncPrintifyManual() {
  await requireAdmin()
  try {
    const result = await syncStorefrontWithPrintify();
    if (!result.success) return { success: false, message: result.error || "Sync Failed." }
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, message: `Manual Sync: ${result.count} products processed.` }
  } catch (err) {
    return { success: false, message: "Internal Server Error during sync." }
  }
}

// ---------------------------------------------------------------
//  DESIGN STUDIO — create products in-house via the Printify API
// ---------------------------------------------------------------

/** Lists popular product types (blueprints) for the design picker. */
export async function getDesignBlueprints() {
  await requireAdmin()
  const blueprints = await getPrintifyBlueprints()
  if (!blueprints) return { success: false, blueprints: [] as BlueprintSummary[], error: "Could not reach Printify catalog." }
  return { success: true, blueprints, error: undefined as string | undefined }
}

type PrintSide = { position: string; width: number; height: number }
type VariantInfo = { id: number; color: string; size: string }

/**
 * Generates an AI image from a text prompt (free, via Pollinations) and returns
 * it as a base64 data URL — fetched server-side to avoid CORS / canvas tainting.
 */
export async function generateAiImage(prompt: string) {
  await requireAdmin()
  const clean = prompt?.trim()
  if (!clean) return { success: false, dataUrl: "", error: "Describe the image you want." }

  try {
    const url =
      `https://image.pollinations.ai/prompt/${encodeURIComponent(clean)}` +
      `?width=1024&height=1024&nologo=true&model=flux`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 90_000)
    const res = await fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer))

    if (!res.ok) return { success: false, dataUrl: "", error: "AI generation failed. Try again." }

    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.byteLength < 500) return { success: false, dataUrl: "", error: "AI returned an empty image. Try a different prompt." }

    const contentType = res.headers.get("content-type") || "image/jpeg"
    const dataUrl = `data:${contentType};base64,${buf.toString("base64")}`
    return { success: true, dataUrl, error: undefined as string | undefined }
  } catch {
    return { success: false, dataUrl: "", error: "AI generation timed out or failed. Try again." }
  }
}

/** Returns print sides + variants (colors/sizes) for a blueprint's design editor. */
export async function getBlueprintCanvas(blueprintId: number) {
  await requireAdmin()
  const setup = await getBlueprintSetup(blueprintId)
  if (!setup) return { success: false, sides: [] as PrintSide[], variants: [] as VariantInfo[], providerTitle: "", error: "Could not load print area." }
  return {
    success: true,
    sides: setup.placeholders as PrintSide[],
    variants: setup.variantDetails as VariantInfo[],
    providerTitle: setup.providerTitle,
    error: undefined as string | undefined,
  }
}

/**
 * Full in-house creation flow:
 *   upload artwork → place on blueprint → create on Printify → save to Unrwly DB.
 * Returns the new local product id so the UI can redirect to its editor.
 */
export async function createDesignedProduct(input: {
  blueprintId: number
  // Each side's flattened design as a PNG data URL (data:image/png;base64,...)
  designs: { position: string; dataUrl: string }[]
  // Optional subset of variant ids (selected colors/sizes). Empty/undefined = all.
  variantIds?: number[]
  title: string
  description: string
  price: number
}) {
  await requireAdmin()

  if (!input.title?.trim()) return { success: false, error: "Product name is required." }
  if (!input.designs?.length) return { success: false, error: "Design at least one side first." }
  if (!input.price || input.price <= 0) return { success: false, error: "Set a valid retail price." }

  // 1. Resolve the blueprint's provider + variants + print positions
  const setup = await getBlueprintSetup(input.blueprintId)
  if (!setup) return { success: false, error: "Could not load product options from Printify." }

  // Restrict to the selected variants (colors/sizes), falling back to all
  const allowed = new Set(setup.variantIds)
  const chosen = (input.variantIds || []).filter((id) => allowed.has(id))
  const variantIds = chosen.length > 0 ? chosen : setup.variantIds

  // 2. Push each side's artwork straight to Printify as base64 (no external storage)
  const sides = []
  for (const d of input.designs) {
    const base64 = d.dataUrl.includes(",") ? d.dataUrl.split(",")[1] : d.dataUrl
    const upload = await uploadArtworkToPrintify({ contents: base64 }, `${input.title.slice(0, 30)}-${d.position}.png`)
    if (!upload?.id) return { success: false, error: `Printify rejected the "${d.position}" artwork upload.` }
    sides.push({ position: d.position, imageId: upload.id })
  }

  // 3. Create the designed product on Printify (auto-generates mockups)
  const created = await createDesignedPrintifyProduct({
    blueprintId: input.blueprintId,
    providerId: setup.providerId,
    variantIds,
    sides,
    title: input.title.trim(),
    description: input.description?.trim() || "",
    priceCents: Math.round(input.price * 100),
  })

  if (!created.success) {
    return { success: false, error: typeof created.error === "string" ? created.error : "Printify product creation failed." }
  }

  // Build a mockup gallery with one image per selected COLOR (so color choice is visible)
  const colorOf = new Map(setup.variantDetails.map((v) => [v.id, v.color]))
  const productImages: any[] = created.product?.images || []
  const seenColor = new Set<string>()
  const perColor: string[] = []
  for (const img of productImages) {
    if (!(img.is_default || /front/i.test(img.position || ""))) continue
    const color = colorOf.get(img.variant_ids?.[0]) || img.position || "x"
    if (seenColor.has(color)) continue
    seenColor.add(color)
    if (img.src) perColor.push(img.src)
    if (perColor.length >= 10) break
  }
  const mockups = perColor.length > 0 ? perColor : created.mockups

  // 4. Persist to the Unrwly storefront database (DRAFT until published)
  const local = await prisma.product.upsert({
    where: { printifyId: created.printifyId },
    update: {
      name: input.title.trim(),
      description: input.description?.trim() || "",
      imageUrl: created.mockupUrl || "",
      cost: created.baseCost,
      source: "STUDIO",
    },
    create: {
      printifyId: created.printifyId,
      name: input.title.trim(),
      description: input.description?.trim() || "",
      price: input.price,
      cost: created.baseCost,
      imageUrl: created.mockupUrl || "",
      status: "DRAFT",
      source: "STUDIO",
    },
  })

  revalidatePath("/admin/products")
  return { success: true, productId: local.id, mockupUrl: created.mockupUrl, mockups }
}

/** Sets a product's main storefront image (e.g. when picking a colour mockup). */
export async function setProductImage(productId: string, imageUrl: string) {
  await requireAdmin()
  await prisma.product.update({ where: { id: productId }, data: { imageUrl } })
  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}

export async function createCollection(name: string, description: string) {
  await requireAdmin()
  const handle = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  await prisma.collection.create({ data: { name, description, handle } })
  revalidatePath("/admin/products/collections")
  revalidatePath("/collections")
  return { success: true }
}

export async function deleteCollection(id: string) {
  await requireAdmin()
  await prisma.collection.delete({ where: { id } })
  revalidatePath("/admin/products/collections")
  return { success: true }
}

export async function deleteManyProducts(productIds: string[]) {
  await requireAdmin()
  await prisma.product.deleteMany({ where: { id: { in: productIds } } })
  revalidatePath("/admin/products")
  return { success: true }
}
