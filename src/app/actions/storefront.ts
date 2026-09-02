"use server"

import { prisma } from "@/lib/prisma"

export async function getVisibleCollections() {
  try {
    const collections = await prisma.collection.findMany({
      select: {
        id: true,
        name: true,
        handle: true,
        imageUrl: true,
      },
    })
    return collections
  } catch (error) {
    console.error("Failed to fetch collections:", error)
    return []
  }
}
