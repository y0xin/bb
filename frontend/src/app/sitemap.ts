import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://promarket.ru';
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/catalog`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/portfolio`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/quiz`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${baseUrl}/compare`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.4 },
    { url: `${baseUrl}/chat`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
  ];

  try {
    const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
      fetch(`${strapiUrl}/api/products?pagination[limit]=1000`).then(r => r.json()),
      fetch(`${strapiUrl}/api/categories?pagination[limit]=100`).then(r => r.json())
    ]);

    const productPages = productsData?.map((p: any) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })) || [];

    const categoryPages = categoriesData?.map((c: any) => ({
      url: `${baseUrl}/catalog/${c.slug || c.name.toLowerCase().replace(/\s+/g, '-')}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })) || [];

    return [...staticPages, ...productPages, ...categoryPages];
  } catch (e) {
    console.error('Sitemap fetch failed', e);
    return staticPages;
  }
}
