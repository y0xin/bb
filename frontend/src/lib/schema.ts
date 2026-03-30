export function generateProductJsonLd(product: {
  name: string;
  description: string;
  price: number;
  image: string;
  slug: string;
  rating: number;
  stock: number;
  category: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    url: `https://promarket.ru/product/${product.slug}`,
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'PRO MARKET',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      bestRating: '5',
      worstRating: '1',
      ratingCount: '100',
    },
  };
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PRO MARKET',
    url: 'https://promarket.ru',
    logo: 'https://promarket.ru/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+79991234567',
      contactType: 'customer service',
      availableLanguage: ['ru'],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Москва',
      addressCountry: 'RU',
    },
    sameAs: ['https://t.me/promarket_ru'],
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
