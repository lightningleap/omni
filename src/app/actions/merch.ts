"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth";

/**
 * Robust Network Resilience Wrapper
 * Retries database calls if there are temporary connection hiccups
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.code === 'EAI_AGAIN' || error.message.includes('getaddrinfo'))) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function updateMerchSettings(data: {
  heroVideoUrls?: string[],
  heroImageUrl?: string | null,
  promoAnnouncement?: string | null
}) {
  await requireAdmin()

  await prisma.storeConfig.upsert({
    where: { id: "global" },
    update: {
      heroVideoUrls: data.heroVideoUrls || [],
      heroImageUrl: data.heroImageUrl,
      promoAnnouncement: data.promoAnnouncement,
    },
    create: {
      id: "global",
      heroVideoUrls: data.heroVideoUrls || [],
      heroImageUrl: data.heroImageUrl,
      promoAnnouncement: data.promoAnnouncement,
    }
  })

  revalidatePath("/")
  return { success: true }
}

export async function getDiscoveryItems(section: string) {
  return await withRetry(() => prisma.discoveryItem.findMany({
    where: { section },
    include: { collection: true },
    orderBy: { order: "asc" }
  }))
}

export async function upsertDiscoveryItem(data: {
  section: string,
  collectionId: string,
  customImageUrl?: string | null,
  customDescription?: string
}) {
  await requireAdmin()

  await withRetry(() => prisma.discoveryItem.upsert({
    where: {
      section_collectionId: {
        section: data.section,
        collectionId: data.collectionId
      }
    },
    update: {
      customImageUrl: data.customImageUrl,
      customDescription: data.customDescription,
    },
    create: {
      section: data.section,
      collectionId: data.collectionId,
      customImageUrl: data.customImageUrl,
      customDescription: data.customDescription,
    }
  }))

  revalidatePath("/")
  revalidatePath("/admin/content")
  return { success: true }
}

export async function removeDiscoveryItem(id: string) {
  await requireAdmin()
  await withRetry(() => prisma.discoveryItem.delete({ where: { id } }))
  revalidatePath("/")
  revalidatePath("/admin/content")
  return { success: true }
}

export async function updateCollectionImage(collectionId: string, imageUrl: string) {
  await requireAdmin()

  await prisma.collection.update({
    where: { id: collectionId },
    data: { imageUrl }
  })

  revalidatePath("/admin/content")
  revalidatePath("/")
  return { success: true }
}
