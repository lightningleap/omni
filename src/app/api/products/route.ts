import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. Tell Next.js to NEVER cache this API route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'LIVE' },
      orderBy: { createdAt: 'desc' }
    });

    const formattedProducts = products.map(p => ({
      _id: p.id,
      name: p.name,
      slug: p.printifyId,
      image: p.imageUrl,
      price: `$${p.price.toFixed(2)}`,
      rawPrice: p.price
    }));

    return NextResponse.json({ products: formattedProducts });

  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
