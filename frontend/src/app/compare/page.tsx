import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MOCK_PRODUCTS } from '@/mockData';
import Image from 'next/image';
import { Star, CheckCircle2, XCircle } from 'lucide-react';

export default function ComparePage() {
  const products = MOCK_PRODUCTS.slice(0, 3);

  return (
    <main className="min-h-screen hero-gradient flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 flex-1">
        <h1 className="text-5xl font-black mb-4">Сравнение товаров</h1>
        <p className="text-gray-500 mb-12">Сравнивайте интересующие вас товары бок о бок</p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr>
                <th className="text-left p-4 text-sm text-gray-400 uppercase tracking-wider w-40">Характеристика</th>
                {products.map(p => (
                  <th key={p.id} className="p-4 text-center">
                    <div className="glass rounded-3xl p-6 border border-white/10">
                      <div className="relative w-full h-40 mb-4 rounded-2xl overflow-hidden">
                        <Image src={p.image} alt={p.name} fill className="object-cover" />
                      </div>
                      <h3 className="font-bold text-lg">{p.name}</h3>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-white/5">
                <td className="p-4 font-medium text-gray-400">Цена</td>
                {products.map(p => (
                  <td key={p.id} className="p-4 text-center text-2xl font-black">${p.price}</td>
                ))}
              </tr>
              <tr className="border-t border-white/5">
                <td className="p-4 font-medium text-gray-400">Категория</td>
                {products.map(p => (
                  <td key={p.id} className="p-4 text-center">
                    <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-sm font-bold">
                      {typeof p.category === 'string' ? p.category : p.category?.name || 'Без категории'}
                    </span>
                  </td>
                ))}
              </tr>
              <tr className="border-t border-white/5">
                <td className="p-4 font-medium text-gray-400">Рейтинг</td>
                {products.map(p => (
                  <td key={p.id} className="p-4 text-center">
                    <span className="inline-flex items-center gap-1"><Star size={16} className="text-yellow-500 fill-yellow-500" /> {p.rating}</span>
                  </td>
                ))}
              </tr>
              <tr className="border-t border-white/5">
                <td className="p-4 font-medium text-gray-400">Наличие</td>
                {products.map(p => (
                  <td key={p.id} className="p-4 text-center">
                    {p.stock > 0
                      ? <span className="inline-flex items-center gap-1 text-emerald-500"><CheckCircle2 size={16} /> В наличии</span>
                      : <span className="inline-flex items-center gap-1 text-red-500"><XCircle size={16} /> Нет</span>
                    }
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </main>
  );
}
