import CatalogClient from '@/components/catalog/CatalogClient';
import { Product, Category } from '@/types';

export const dynamic = 'force-dynamic';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

async function getCategoryData(categorySlug: string) {
  const [pRes, cRes] = await Promise.all([
    fetch(`${STRAPI_URL}/api/products?populate=*`, { next: { revalidate: 3600 } }).then(r => r.json()),
    fetch(`${STRAPI_URL}/api/categories`, { next: { revalidate: 3600 } }).then(r => r.json())
  ]);

  const products = pRes.data ? pRes.data.map((p: any) => ({
    ...p,
    id: p.id,
    image: p.image?.url ? `${STRAPI_URL}${p.image.url}` : '/placeholder.png'
  } as Product)) : [];

  const categories = cRes.data ? ['All', ...cRes.data.map((c: Category) => c.name)] : ['All'];
  
  // Find the category by slug if possible, or just pass the slug
  const category = cRes.data?.find((c: Category) => c.slug === categorySlug || c.name.toLowerCase().replace(/\s+/g, '-') === categorySlug);
  const categoryName = category ? category.name : categorySlug;

  return { products, categories, categoryName };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const { products, categories, categoryName } = await getCategoryData(category);

  return (
    <CatalogClient 
      initialProducts={products} 
      initialCategories={categories} 
      categorySlug={categoryName}
    />
  );
}
