'use client';

import ProductEditPage from '../[id]/page';

export default function ProductNewPage() {
  return <ProductEditPage params={Promise.resolve({ id: 'new' })} />;
}

