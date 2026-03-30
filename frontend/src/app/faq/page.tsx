import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FaqItem from '@/components/FaqItem';
import { FAQ } from '@/types';

export default async function FaqPage() {
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
  let faqs: { q: string; a: string; category: string }[] = [];
  
  try {
    const res = await fetch(`${strapiUrl}/api/faqs?sort=category:asc`, { cache: 'no-store' });
    const { data } = await res.json();
    if (data) {
      faqs = data.map((f: FAQ) => ({
        q: f.question,
        a: f.answer,
        category: f.category
      }));
    }
  } catch (e) {
    console.error('FAQ fetch error', e);
  }

  // Group by category
  const groupedFaqs: Record<string, { q: string; a: string; category: string }[]> = {};
  faqs.forEach((f) => {
    if (!groupedFaqs[f.category]) groupedFaqs[f.category] = [];
    groupedFaqs[f.category].push(f);
  });

  return (
    <main className="min-h-screen hero-gradient flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-24 flex-1 w-full">
        <h1 className="text-5xl md:text-7xl font-black mb-4 text-center tracking-tighter text-white">Частые вопросы</h1>
        <p className="text-center text-gray-500 mb-16 font-bold uppercase tracking-widest text-xs">Все что вам нужно знать о PRO MARKET</p>
        
        <div className="space-y-16">
          {Object.entries(groupedFaqs).map(([category, items]) => (
            <section key={category} className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="h-0.5 flex-1 bg-white/5" />
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 whitespace-nowrap">{category}</h2>
                  <div className="h-0.5 flex-1 bg-white/5" />
               </div>
               <div className="grid gap-4">
                  {items.map((faq, i) => (
                    <FaqItem key={i} q={faq.q} a={faq.a} />
                  ))}
               </div>
            </section>
          ))}
          {faqs.length === 0 && (
            <div className="text-center py-20 opacity-30">
               <p className="text-sm font-black uppercase tracking-widest text-white">Раздел пополняется...</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
