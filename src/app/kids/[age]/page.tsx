import type { Metadata } from 'next';
import PlpPage from '@/components/plp/PlpPage';
import { getShopCategory, KIDS_AGE_SLUGS } from '@/data/shopCategories';

/**
 * `/kids/<age>` — the destinations behind the homepage "Shop by Age" rail.
 *
 * A separate route family purely so the URL reads the way a parent would say it
 * (`/kids/3-5`). Everything else is shared: the same registry, the same page
 * component, the same filters, sorting and chips as any other listing page.
 */

interface KidsAgePageProps {
  params: Promise<{ age: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export function generateStaticParams() {
  return KIDS_AGE_SLUGS.map((age) => ({ age }));
}

export async function generateMetadata({ params }: KidsAgePageProps): Promise<Metadata> {
  const { age } = await params;
  const category = getShopCategory(age, '/kids');
  if (!category) return { title: 'Kids' };

  return {
    title: `Kids ${category.label}`,
    description: category.description,
    alternates: { canonical: `/kids/${category.slug}` },
  };
}

export default async function KidsAgePage({ params, searchParams }: KidsAgePageProps) {
  const [{ age }, query] = await Promise.all([params, searchParams]);
  return <PlpPage slug={age} basePath="/kids" searchParams={query} />;
}
