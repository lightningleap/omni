import type { Metadata } from 'next';
import PlpPage from '@/components/plp/PlpPage';
import { getShopCategory, SHOP_CATEGORY_SLUGS } from '@/data/shopCategories';

/**
 * `/shop/<category>` — every Adult listing page, plus the Kids overview pages.
 *
 * The slug is looked up in the category registry (`data/shopCategories.ts`),
 * which decides the audience, the breadcrumb trail and any scope. Nothing about
 * Men, Kids or Oversized is written here: adding a category adds an entry there
 * and this route serves it. Age groups live under `/kids/<age>` instead — same
 * registry, same page component.
 */

interface ShopPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export function generateStaticParams() {
  return SHOP_CATEGORY_SLUGS.map((category) => ({ category }));
}

export async function generateMetadata({ params }: ShopPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getShopCategory(slug, '/shop');
  if (!category) return { title: 'Shop' };

  return {
    title: category.label,
    description: category.description,
    alternates: { canonical: `/shop/${category.slug}` },
  };
}

export default async function ShopCategoryPage({ params, searchParams }: ShopPageProps) {
  const [{ category: slug }, query] = await Promise.all([params, searchParams]);
  return <PlpPage slug={slug} basePath="/shop" searchParams={query} />;
}
