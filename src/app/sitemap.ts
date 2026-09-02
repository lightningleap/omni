import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { ALL_CATEGORY_HREFS } from '@/data/shopCategories'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://unrwly.com'

  // Read from our own database rather than walking the whole Printify catalogue.
  // Printify takes ~36s to page through every shop, which is far past the
  // function timeout a crawler request gets — and it would also list products
  // that are drafted or hidden in the storefront. The database knows which
  // products are actually LIVE.
  const products = await prisma.product.findMany({
    where: { status: 'LIVE' },
    select: { printifyId: true, updatedAt: true },
  })
  const productRoutes = products.map((p) => ({
    url: `${baseUrl}/products/${p.printifyId}`,
    lastModified: p.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Every category listing page. Driven off the registry, so a new category is
  // indexed the moment it's added — no second list to keep in step.
  const categoryRoutes = ALL_CATEGORY_HREFS.map((href) => ({
    url: `${baseUrl}${href}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  const staticRoutes = [
    '',
    '/collections',
    '/meet-unrwly',
    '/about',
    '/faq',
    '/journal',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    // The founder's story is the page that converts a browser into a customer
    // for a one-person studio, so it ranks above the other editorial pages.
    priority: route === '' ? 1 : route === '/meet-unrwly' ? 0.7 : 0.5,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
