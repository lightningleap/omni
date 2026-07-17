import { MetadataRoute } from 'next'
import { fetchPrintifyProducts } from '@/lib/printify'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://unrwly.com'

  // Fetch Products via shared Printify utility
  const products = await fetchPrintifyProducts() || [];
  const productRoutes = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const staticRoutes = [
    '',
    '/collections',
    '/about',
    '/faq',
    '/journal',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.5,
  }))

  return [...staticRoutes, ...productRoutes]
}
