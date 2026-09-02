import React from 'react';
import ProductGalleryClient from './ProductGalleryClient';

const dummyProducts = [
  {
    _id: 'prod_1',
    variantId: 'var_1',
    name: 'Signature Heavyweight Hoodie',
    slug: 'signature-heavyweight-hoodie',
    handle: 'signature-heavyweight-hoodie',
    description: 'Premium cotton blend.',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000',
    price: '65.00 USD',
    rawPrice: 65,
    availableForSale: true,
    category: 'Apparel'
  },
  {
    _id: 'prod_2',
    variantId: 'var_2',
    name: 'Matte Black Phone Case',
    slug: 'matte-black-phone-case',
    handle: 'matte-black-phone-case',
    description: 'Sleek drop protection.',
    image: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?q=80&w=1000',
    price: '25.00 USD',
    rawPrice: 25,
    availableForSale: true,
    category: 'Accessories'
  }
];

export default async function ProductGallery() {
  return <ProductGalleryClient products={dummyProducts} />;
}
