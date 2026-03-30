"use client";
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { Search, Filter, X } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { searchProducts } from '@/lib/search';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Product } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

interface CatalogClientProps {
  initialProducts: Product[];
  initialCategories: string[];
  categorySlug?: string;
}

export default function CatalogClient({ initialProducts, initialCategories, categorySlug }: CatalogClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'newest'>('default');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  // Debounced URL update
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedQuery) {
      params.set('q', debouncedQuery);
    } else {
      params.delete('q');
    }
    // Only push if query actually changed to avoid redundant history entries
    if (params.get('q') !== (searchParams.get('q') || '')) {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [debouncedQuery, pathname, router, searchParams]);

  const filteredProducts = useMemo(() => {
    let result = searchProducts(initialProducts, query);
    if (selectedCategory !== 'All') {
      result = result.filter(p => {
        const catName = typeof p.category === 'string' 
          ? p.category 
          : p.category?.name;
        
        const catSlug = typeof p.category === 'string' 
          ? p.category.toLowerCase().replace(/\s+/g, '-')
          : p.category?.slug;

        return catName === selectedCategory || catSlug === selectedCategory;
      });
    }
    
    // Apply Sorting
    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result = [...result].sort((a, b) => b.id - a.id);
    }

    return result;
  }, [initialProducts, query, selectedCategory, sortBy]);

  const updateCategoryParam = (cat: string) => {
    // For CNC (SEF) filters, we use the URL path
    if (cat === 'All') {
        router.push('/catalog', { scroll: false });
    } else {
        const slug = cat.toLowerCase().replace(/\s+/g, '-');
        router.push(`/catalog/${slug}`, { scroll: false });
    }
    setSelectedCategory(cat);
  };

  return (
    <main className="min-h-screen hero-gradient pb-20 text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 pt-12 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <h1 className="text-5xl font-black tracking-tighter uppercase italic">
            {selectedCategory === 'All' ? 'Каталог' : selectedCategory}
          </h1>
          
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск товара..." 
                className="w-full glass pl-12 pr-4 py-4 rounded-3xl outline-none border border-white/10 group-hover:border-white/20 focus:ring-2 focus:ring-blue-500 transition-all font-medium text-white bg-transparent"
              />
            </div>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`glass p-4 px-6 rounded-3xl transition-all flex items-center space-x-2 border shadow-xl ${isFilterOpen ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 overflow-hidden'}`}
            >
              <Filter size={20} className={isFilterOpen ? 'text-blue-500' : 'text-white'} />
              <span className="hidden sm:inline font-black uppercase tracking-widest text-[10px]">Фильтры</span>
            </button>

            {/* Sorting Dropdown */}
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="glass p-4 px-6 rounded-3xl border border-white/10 outline-none text-[10px] font-black uppercase tracking-widest bg-transparent text-white cursor-pointer hover:bg-white/5 transition-all shadow-xl"
            >
              <option value="default" className="bg-black text-white">По умолчанию</option>
              <option value="price-asc" className="bg-black text-white">Дешевле</option>
              <option value="price-desc" className="bg-black text-white">Дороже</option>
              <option value="newest" className="bg-black text-white">Новинки</option>
            </select>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap gap-3 mb-12">
          {initialCategories.map(cat => (
            <button
              key={cat}
              onClick={() => updateCategoryParam(cat)}
              className={`px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                selectedCategory === cat || (cat === 'All' && selectedCategory === 'All')
                ? 'bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-500/40' 
                : 'glass border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat === 'All' ? 'Все категории' : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-40 glass rounded-[50px] border border-white/10 shadow-3xl">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <Search size={48} className="text-gray-500" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-3">Ничего не найдено</h2>
            <p className="text-gray-500 font-medium max-w-md mx-auto">Попробуйте изменить параметры поиска или фильтры, чтобы найти подходящий товар.</p>
            <button 
              onClick={() => { setQuery(''); updateCategoryParam('All'); }}
              className="mt-12 glass px-10 py-5 rounded-2xl text-blue-500 font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 hover:text-white transition-all flex items-center gap-3 mx-auto shadow-xl"
            >
              <X size={18} /> Сбросить все
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
