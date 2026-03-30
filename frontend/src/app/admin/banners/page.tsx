"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { Banner } from '@/types';
import Image from 'next/image';

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const res = await fetch(`${strapiUrl}/api/banners?populate=*&sort=sortOrder:asc`);
      const { data } = await res.json();
      if (data) {
        setBanners(data.map((b: any) => ({
          ...b,
          id: b.id,
          image: b.image?.url ? `${strapiUrl}${b.image.url}` : '/placeholder-banner.png'
        })));
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
    if (!confirm('Удалить этот баннер?')) return;
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const res = await fetch(`${strapiUrl}/api/banners/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.jwt}` }
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error('Delete error', e);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">Баннеры</h1>
          <p className="text-gray-500">Управление рекламными баннерами на главной странице</p>
        </div>
        <button 
          onClick={() => { setSelectedBanner(null); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-xl shadow-blue-500/30 active:scale-95"
        >
          <Plus size={20} /> Добавить баннер
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="glass rounded-[32px] border border-white/10 overflow-hidden group shadow-xl hover:border-blue-500/30 transition-all duration-500">
             <div className="relative h-48 w-full bg-white/5">
                <Image 
                  src={banner.image as unknown as string} 
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                  alt={banner.title} 
                />
                <div className="absolute top-4 left-4 flex gap-2">
                   <span className="glass bg-black/50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white">{banner.position}</span>
                   {banner.isActive ? (
                     <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Check size={10} /> Активен</span>
                   ) : (
                     <span className="bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><X size={10} /> Выключен</span>
                   )}
                </div>
             </div>
             <div className="p-6 flex items-center justify-between">
                <div>
                   <h3 className="font-bold text-lg">{banner.title}</h3>
                   <p className="text-gray-500 text-sm truncate max-w-[200px]">{banner.subtitle}</p>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => { setSelectedBanner(banner); setIsModalOpen(true); }}
                    className="p-3 glass rounded-xl text-blue-400 hover:bg-blue-500/10 transition-all"
                   >
                      <Edit size={18} />
                   </button>
                   <button 
                    onClick={() => handleDelete(banner.id)}
                    className="p-3 glass rounded-xl text-red-500 hover:bg-red-500/10 transition-all"
                   >
                      <Trash2 size={18} />
                   </button>
                </div>
             </div>
          </div>
        ))}
        {banners.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center glass rounded-[40px] border border-dashed border-white/10">
             <ImageIcon size={48} className="mx-auto text-gray-700 mb-4" />
             <p className="text-gray-500 font-bold">Ни одного баннера не создано</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <BannerModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          banner={selectedBanner} 
          onSave={fetchData} 
        />
      )}
    </div>
  );
}

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: Banner | null;
  onSave: () => void;
}

function BannerModal({ onClose, banner, onSave }: BannerModalProps) {
  const [formData, setFormData] = useState<Partial<Banner>>(banner || { 
    title: '', 
    subtitle: '', 
    link: '', 
    position: 'hero', 
    isActive: true, 
    sortOrder: 0 
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const url = banner ? `${strapiUrl}/api/banners/${banner.id}` : `${strapiUrl}/api/banners`;
      const res = await fetch(url, {
        method: banner ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.jwt}`
        },
        body: JSON.stringify({ data: { ...formData, publishedAt: new Date() } })
      });
      if (res.ok) {
        onSave();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="glass w-full max-w-xl rounded-[40px] border border-white/10 overflow-hidden shadow-3xl">
        <header className="p-8 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-2xl font-black">{banner ? 'Редактировать баннер' : 'Новый баннер'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X /></button>
        </header>
        <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Заголовок</label>
                  <input 
                    type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full glass p-4 rounded-2xl outline-none border border-transparent focus:border-blue-500/50 transition-all font-bold text-white bg-transparent"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Позиция</label>
                  <select 
                    value={formData.position} 
                    onChange={e => setFormData({...formData, position: e.target.value as Banner['position']})}
                    className="w-full glass p-4 rounded-2xl outline-none border border-transparent focus:border-blue-500/50 transition-all font-bold appearance-none bg-black/20 text-white"
                  >
                    <option value="hero">Hero (Главная)</option>
                    <option value="catalog_top">Каталог (Верх)</option>
                    <option value="sidebar">Сайдбар</option>
                  </select>
               </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Подзаголовок</label>
                <textarea 
                  value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})}
                  className="w-full glass p-4 rounded-2xl outline-none border border-transparent focus:border-blue-500/50 transition-all font-medium h-24 text-white bg-transparent"
                />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-4 glass p-4 rounded-2xl border border-white/5">
                 <input 
                  type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="w-6 h-6 rounded-lg accent-blue-600"
                 />
                 <span className="font-black text-sm uppercase tracking-widest text-white">Активен</span>
              </div>
              <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Порядок</label>
                  <input 
                    type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value)})}
                    className="w-full glass p-4 rounded-2xl outline-none border border-transparent focus:border-blue-500/50 transition-all font-bold text-white bg-transparent"
                  />
               </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={20} />
                  <span>Сохранить изменения</span>
                </>
              )}
            </button>
        </form>
      </div>
    </div>
  );
}
