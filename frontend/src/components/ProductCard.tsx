"use client";
import { Product } from '@/types';
import { ShoppingCart, Star, Check } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/useCart';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart(state => state.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="glass group rounded-3xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all duration-500">
      <div className="relative h-64 w-full overflow-hidden">
        <Image 
          src={product.image} 
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 right-4 glass px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
          <Star size={12} className="text-yellow-500 fill-yellow-500" />
          <span>{product.rating}</span>
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-xs text-blue-500 font-medium mb-2 uppercase tracking-wider">
          {typeof product.category === 'string' ? product.category : product.category?.name || 'Без категории'}
        </p>
        <h3 className="text-xl font-bold mb-4 line-clamp-1">{product.name}</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-black">${product.price}</span>
            {product.oldPrice && (
              <span className="ml-2 text-sm text-black/40 line-through">${product.oldPrice}</span>
            )}
          </div>
          <button 
            onClick={handleAdd}
            className={`${added ? 'bg-emerald-500' : 'bg-blue-600 hover:bg-blue-700'} text-white p-3 rounded-2xl transition-all shadow-lg shadow-blue-500/30`}
          >
            {added ? <Check size={20} /> : <ShoppingCart size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
