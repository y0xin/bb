"use client";
import { ShoppingCart, Check, Scale } from 'lucide-react';
import { useCart } from '@/context/useCart';
import { useState } from 'react';
import { Product } from '@/types';

interface ProductActionsProps {
  product: Product;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const addItem = useCart(state => state.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <button 
        onClick={handleAdd}
        className={`flex-1 ${added ? 'bg-emerald-500' : 'bg-blue-600 hover:bg-blue-700'} text-white py-5 rounded-3xl font-black text-lg shadow-2xl transition-all flex items-center justify-center space-x-3 active:scale-95 group relative overflow-hidden`}
      >
        <div className={`absolute inset-0 bg-white/20 transition-transform duration-500 ${added ? 'translate-y-0' : 'translate-y-full'}`} />
        {added ? <Check size={24} /> : <ShoppingCart size={24} />}
        <span className="relative z-10">{added ? 'Добавлено!' : 'В корзину'}</span>
      </button>
      
      <button className="glass px-10 py-5 rounded-3xl font-black text-lg hover:bg-white/10 transition-all border border-white/20 flex items-center justify-center gap-3 group active:scale-95">
        <Scale size={24} className="group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">Сравнить</span>
      </button>
    </div>
  );
}
