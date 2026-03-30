"use client";
import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Package, DollarSign, List, FileText } from 'lucide-react';
import { Product, Category } from '@/types';

interface ProductFormData {
  name: string;
  price: string | number;
  oldPrice: string | number;
  stock: string | number;
  category: string | number;
  description: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductFormData) => Promise<void>;
  product?: Product | null;
  categories: Category[];
}

export default function ProductModal({ isOpen, onClose, onSave, product, categories }: ProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: '',
    oldPrice: '',
    stock: '',
    category: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice || '',
        stock: product.stock,
        category: (product.category && typeof product.category === 'object') ? product.category.id : (product.category || ''),
        description: product.description,
      });
    } else {
      setFormData({
        name: '',
        price: '',
        oldPrice: '',
        stock: '',
        category: (categories && categories.length > 0) ? categories[0].id : '',
        description: '',
      });
    }
  }, [product, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      alert('Ошибка при сохранении товара');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass w-full max-w-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h2 className="text-2xl font-black">{product ? 'Редактировать товар' : 'Добавить товар'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Package size={12} /> Название товара
              </label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="iPhone 15 Pro"
                className="w-full glass p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <List size={12} /> Категория
              </label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full glass p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={12} /> Цена ($)
              </label>
              <input 
                type="number" 
                required
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                placeholder="999"
                className="w-full glass p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={12} /> Старая цена (необязательно)
              </label>
              <input 
                type="number" 
                value={formData.oldPrice}
                onChange={e => setFormData({...formData, oldPrice: e.target.value})}
                placeholder="1199"
                className="w-full glass p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <FileText size={12} /> Запас (Stock)
              </label>
              <input 
                type="number" 
                required
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: e.target.value})}
                placeholder="50"
                className="w-full glass p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Upload size={12} /> Изображение
              </label>
              <div className="w-full glass p-3 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-all">
                <Upload size={18} className="text-gray-500" />
                <span className="text-sm font-bold text-gray-500 italic">Скоро: Загрузка файлов</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <FileText size={12} /> Описание
            </label>
            <textarea 
              rows={4}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Введите описание товара..."
              className="w-full glass p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium resize-none"
            />
          </div>

          <div className="pt-6 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 glass py-4 rounded-2xl font-bold hover:bg-white/5 transition-all text-sm uppercase tracking-widest"
            >
              Отмена
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/30 text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
