export const dynamic = 'force-dynamic';
import ProductActions from '@/components/ProductActions';
import Navbar from '@/components/Navbar';
import { ArrowLeft, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { Product } from '@/types';
import { Metadata } from 'next';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function generateStaticParams() {
  try {
    const res = await fetch(`${STRAPI_URL}/api/products?fields[0]=slug&pagination[limit]=100`);
    const { data } = await res.json();
    if (!data) return [];
    return data.map((p: { slug: string }) => ({ slug: p.slug }));
  } catch (e) {
    console.error('generateStaticParams error', e);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${STRAPI_URL}/api/products?filters[slug][$eq]=${slug}`);
    const { data } = await res.json();
    if (!data || data.length === 0) return { title: 'Product Not Found' };
    const p = data[0];
    return {
      title: p.name,
      description: p.description,
      openGraph: {
        title: p.name,
        description: p.description,
        images: [p.image?.url ? `${STRAPI_URL}${p.image.url}` : '/og-image.jpg'],
      }
    };
  } catch (e) {
    return { title: 'Product Detail' };
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product: Product | null = null;

  try {
    const res = await fetch(`${STRAPI_URL}/api/products?filters[slug][$eq]=${slug}&populate=*`, { next: { revalidate: 3600 } });
    const { data } = await res.json();
    
    if (!data || data.length === 0) return notFound();
    
    const rawProduct = data[0];
    product = {
      ...rawProduct,
      id: rawProduct.id,
      image: rawProduct.image?.url ? `${STRAPI_URL}${rawProduct.image.url}` : '/placeholder.png',
      category: rawProduct.category?.name || 'Без категории'
    };
  } catch (e) {
    return notFound();
  }

  if (!product) return notFound();

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    "brand": { "@type": "Brand", "name": "PRO MARKET" },
    "offers": {
      "@type": "Offer",
      "url": `https://promarket.ru/product/${product.slug}`,
      "priceCurrency": "USD",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <main className="min-h-screen hero-gradient pb-32 text-white">
      <Navbar />
      <Script id="product-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <div className="max-w-7xl mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <Link href="/catalog" className="inline-flex items-center space-x-3 text-gray-400 hover:text-blue-500 mb-16 transition-all font-black uppercase tracking-[0.2em] text-[10px] group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Назад в каталог</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <div className="relative h-[450px] md:h-[700px] rounded-[50px] overflow-hidden glass border border-white/10 shadow-3xl group">
            <Image 
              src={product.image} 
              alt={product.name} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-1000" 
              priority
            />
          </div>

          <div className="flex flex-col space-y-12">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="glass bg-blue-600/10 text-blue-500 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-500/20">
                        {typeof product.category === 'string' ? product.category : product.category?.name || 'Без категории'}
                    </span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase italic">{product.name}</h1>
            </div>
            
            <div className="flex items-end gap-8">
               <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-3 ml-1">Специальная цена</span>
                  <span className="text-7xl font-black text-white tracking-tight leading-none">${product.price}</span>
               </div>
               {product.oldPrice && (
                 <div className="flex flex-col opacity-30 pb-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 leading-none">Обычная</span>
                    <span className="text-3xl font-bold line-through tracking-tighter decoration-blue-500 decoration-2">${product.oldPrice}</span>
                 </div>
               )}
            </div>

            <div className="glass p-10 rounded-[44px] border border-white/10 space-y-8 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                  Характеристики
               </h3>
               <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  {product.attributes && product.attributes.length > 0 ? product.attributes.map((attr, i: number) => (
                    <div key={i} className="flex flex-col border-b border-white/5 pb-2">
                       <span className="text-gray-500 text-[9px] uppercase font-black tracking-widest mb-1">{attr.key}</span>
                       <span className="text-white font-bold text-sm tracking-tight">{attr.value}</span>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-sm italic font-medium col-span-2">Спецификации временно уточняются</p>
                  )}
               </div>
            </div>

            <p className="text-lg text-gray-400 font-medium leading-relaxed max-w-xl">
              {product.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/5">
              <div className="flex flex-col gap-2 group">
                <div className="w-10 h-10 glass rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500/10 transition-colors">
                    <ShieldCheck size={20} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-500">2 года гарантии</span>
              </div>
              <div className="flex flex-col gap-2 group">
                <div className="w-10 h-10 glass rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500/10 transition-colors">
                    <Truck size={20} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-500">Бесплатная доставка</span>
              </div>
              <div className="flex flex-col gap-2 group">
                <div className="w-10 h-10 glass rounded-2xl flex items-center justify-center text-purple-500 group-hover:bg-purple-500/10 transition-colors">
                    <RefreshCcw size={20} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-500">14 дней возврат</span>
              </div>
            </div>

            <div className="pt-4">
                 <ProductActions product={product} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
