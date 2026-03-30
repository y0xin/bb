"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Layers
} from 'lucide-react';
import { exportToExcel, importFromExcel, formatProductForExcel } from '@/lib/excel';
import { useAuth } from '@/context/useAuth';
import { Product, Category } from '@/types';
import Image from 'next/image';

import ProductModal from '@/components/admin/ProductModal';

export default function AdminCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const [pRes, cRes] = await Promise.all([
        fetch(`${strapiUrl}/api/products?populate=*&sort=createdAt:desc`).then(r => r.json()),
        fetch(`${strapiUrl}/api/categories`).then(r => r.json())
      ]);

      if (pRes.data) {
        setProducts(pRes.data.map((p: any) => ({
          ...p,
          id: p.id,
          image: p.image?.url ? `${strapiUrl}${p.image.url}` : '/placeholder.png',
          category: p.category?.name || 'Без категории'
        } as Product)));
      }
      if (cRes.data) {
        setCategories(cRes.data.map((c: any) => ({ id: c.id, ...c } as Category)));
      }
    } catch (e) {
      console.error('Fetch error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const res = await fetch(`${strapiUrl}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.jwt}` // Using JWT from context
        }
      });
      if (res.ok) {
        fetchData();
      } else {
        alert('Ошибка при удалении. Проверьте права доступа.');
      }
    } catch (e) {
      console.error('Delete error', e);
    }
  };

  const handleSave = async (formData: any) => {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    const url = selectedProduct 
      ? `${strapiUrl}/api/products/${selectedProduct.id}`
      : `${strapiUrl}/api/products`;
    
      const res = await fetch(url, {
        method: selectedProduct ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.jwt}`
        },
        body: JSON.stringify({ 
          data: {
            ...formData,
            publishedAt: new Date() // Auto-publish
          } 
        })
      });

    if (res.ok) {
      await fetchData();
    } else {
      const err = await res.json();
      throw new Error(err.error?.message || 'Save failed');
    }
  };

  const handleExport = () => {
    const formattedData = formatProductForExcel(products);
    exportToExcel(formattedData, 'catalog_export');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        const importedData = await importFromExcel(file);
        console.log('Imported Data:', importedData);
        alert('Данные успешно импортированы! Перезагрузите для обновления.');
        await fetchData();
      } catch (error) {
        console.error('Import Error:', error);
        alert('Ошибка при импорте файла');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (typeof p.category === 'string' ? p.category : p.category?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">Каталог товаров</h1>
          <p className="text-gray-500">Управление ассортиментом, вариантами и запасами</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".xlsx, .xls" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="glass px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-2 font-bold hover:bg-white/5 transition-all text-sm text-white"
          >
            <Upload size={18} /> Импорт
          </button>
          <button 
            onClick={handleExport}
            className="glass px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-2 font-bold hover:bg-white/5 transition-all text-sm text-white"
          >
            <Download size={18} /> Экспорт
          </button>
          {['Superadmin', 'Manager', 'Editor'].includes(user?.role || '') && (
            <button 
              onClick={() => { setSelectedProduct(null); setIsModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-blue-500/30 text-sm"
            >
              <Plus size={18} /> Добавить
            </button>
          )}
        </div>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Поиск по названию или категории..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass pl-12 pr-4 py-4 rounded-2xl border border-white/10 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-white bg-transparent"
          />
        </div>
        <button className="glass px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-2 font-bold hover:bg-white/5 transition-all text-white">
          <Filter size={20} /> Фильтры
        </button>
      </div>

      {/* Product Table */}
      <div className="glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="p-6 text-[10px] text-gray-400 uppercase font-black tracking-widest">Фото</th>
                <th className="p-6 text-[10px] text-gray-400 uppercase font-black tracking-widest">Товар</th>
                <th className="p-6 text-[10px] text-gray-400 uppercase font-black tracking-widest">Категория</th>
                <th className="p-6 text-[10px] text-gray-400 uppercase font-black tracking-widest">Цена</th>
                <th className="p-6 text-[10px] text-gray-400 uppercase font-black tracking-widest">Запас</th>
                <th className="p-6 text-[10px] text-gray-400 uppercase font-black tracking-widest text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="p-6 w-16">
                    <div className="relative w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                      <Image 
                        src={p.image as unknown as string} 
                        alt={p.name} 
                        fill
                        className="object-cover w-full h-full" 
                      />
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="font-bold text-sm mb-0.5 text-white">{p.name}</p>
                    <div className="flex items-center gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                       <Layers size={12} className="text-white" />
                       <span className="text-[10px] font-bold uppercase tracking-wider text-white">Варианты: {p.attributes?.length || 0}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="glass bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {typeof p.category === 'string' ? p.category : p.category?.name || 'Без категории'}
                    </span>
                  </td>
                  <td className="p-6 font-bold text-sm text-white">${p.price}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${p.stock > 10 ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      <span className="text-sm font-medium text-white">{p.stock} шт.</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-2 text-gray-400 hover:text-white transition-colors"><Eye size={18} /></button>
                      {['Superadmin', 'Manager', 'Editor'].includes(user?.role || '') && (
                        <>
                          <button 
                            onClick={() => { setSelectedProduct(p); setIsModalOpen(true); }}
                            className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                          ><Edit size={18} /></button>
                          <button 
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-red-500 hover:text-red-400 transition-colors"
                          ><Trash2 size={18} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && (
        <ProductModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          product={selectedProduct}
          categories={categories}
        />
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 font-medium px-4">
         <p>Показано {filteredProducts.length} из {products.length} товаров</p>
         <div className="flex items-center gap-2">
            <button className="glass p-2 px-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest text-white">Назад</button>
            <button className="glass p-2 px-5 rounded-xl border border-blue-500/50 bg-blue-500/10 text-blue-400 font-black">1</button>
            <button className="glass p-2 px-5 rounded-xl border border-white/10 hover:bg-white/5 font-black text-white">2</button>
            <button className="glass p-2 px-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest text-white">Далее</button>
         </div>
      </div>
    </div>
  );
}
