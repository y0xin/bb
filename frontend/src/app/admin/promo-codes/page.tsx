"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Tag, 
  Calendar,
  Percent
} from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { PromoCode } from '@/types';

export default function AdminPromoCodes() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<PromoCode | null>(null);
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const res = await fetch(`${strapiUrl}/api/promo-codes?sort=createdAt:desc`);
      const { data } = await res.json();
      if (data) {
        setPromoCodes(data);
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
    if (!confirm('Удалить этот промо-код?')) return;
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const res = await fetch(`${strapiUrl}/api/promo-codes/${id}`, {
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
          <h1 className="text-4xl font-black mb-2 tracking-tight uppercase text-white">Промо-коды</h1>
          <p className="text-gray-500 font-medium">Управление скидками и купонами магазина</p>
        </div>
        <button 
          onClick={() => { setSelectedPromo(null); setIsModalOpen(true); }}
          className="bg-purple-600 hover:bg-purple-700 shadow-purple-500/30 text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-xl active:scale-95"
        >
          <Plus size={20} /> Создать код
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {promoCodes.map((promo) => (
          <div key={promo.id} className="glass rounded-[32px] border border-white/10 p-8 shadow-xl hover:border-purple-500/30 transition-all duration-500 group relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all" />
             
             <div className="flex items-center justify-between mb-6 text-white">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-500">
                      <Tag size={24} />
                   </div>
                   <span className="text-2xl font-black tracking-tighter">{promo.code}</span>
                </div>
                {promo.isActive ? (
                   <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                ) : (
                   <span className="w-3 h-3 bg-red-500 rounded-full" />
                )}
             </div>

             <div className="space-y-4 mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-400 font-bold uppercase tracking-widest">
                   <Percent size={14} className="text-purple-500" />
                   Скидка: <span className="text-white">{promo.discountPercent}%</span>
                </div>
                {promo.expirationDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-400 font-bold uppercase tracking-widest">
                    <Calendar size={14} className="text-purple-500" />
                    До: <span className="text-white">{new Date(promo.expirationDate).toLocaleDateString()}</span>
                  </div>
                )}
             </div>

             <div className="flex gap-2">
                <button 
                  onClick={() => { setSelectedPromo(promo); setIsModalOpen(true); }}
                  className="flex-1 py-3 glass rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all text-white"
                >
                   <Edit size={16} className="inline mr-2" /> Изменить
                </button>
                <button 
                  onClick={() => handleDelete(promo.id)}
                  className="py-3 px-4 glass rounded-2xl text-red-500 hover:bg-red-500/10 transition-all"
                >
                   <Trash2 size={16} />
                </button>
             </div>
          </div>
        ))}
        {!loading && promoCodes.length === 0 && (
           <div className="col-span-full py-20 text-center glass rounded-[40px] border border-dashed border-white/10 opacity-30">
              <Tag size={48} className="mx-auto mb-4 text-white" />
              <p className="font-black uppercase tracking-widest text-xs text-white">Промо-коды не найдены</p>
           </div>
        )}
      </div>

      {isModalOpen && (
        <PromoModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          promo={selectedPromo} 
          onSave={fetchData} 
        />
      )}
    </div>
  );
}

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  promo: PromoCode | null;
  onSave: () => void;
}

function PromoModal({ onClose, promo, onSave }: PromoModalProps) {
  const [formData, setFormData] = useState<Partial<PromoCode>>(promo || { code: '', discountPercent: 10, isActive: true, expirationDate: '' });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const url = promo ? `${strapiUrl}/api/promo-codes/${promo.id}` : `${strapiUrl}/api/promo-codes`;
      const res = await fetch(url, {
        method: promo ? 'PUT' : 'POST',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in zoom-in-95 duration-300">
      <div className="glass w-full max-w-lg rounded-[40px] border border-white/10 overflow-hidden shadow-3xl">
        <header className="p-8 border-b border-white/5 flex justify-between items-center bg-purple-600/10 text-white">
            <h2 className="text-2xl font-black">{promo ? 'Редактировать код' : 'Новый промо-код'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X /></button>
        </header>
        <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Код скидки (Caps Lock)</label>
                <input 
                  type="text" required value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="SALE2024"
                  className="w-full glass p-5 rounded-3xl outline-none border border-transparent focus:border-purple-500/50 transition-all font-black text-xl tracking-widest text-white bg-transparent"
                />
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Скидка (%)</label>
                  <div className="relative">
                    <input 
                      type="number" required min="1" max="100" value={formData.discountPercent} 
                      onChange={e => setFormData({...formData, discountPercent: parseInt(e.target.value)})}
                      className="w-full glass p-4 pr-12 rounded-2xl outline-none border border-transparent focus:border-purple-500/50 transition-all font-bold text-white bg-transparent"
                    />
                    <Percent size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Дата истечения</label>
                  <input 
                    type="date" value={formData.expirationDate} 
                    onChange={e => setFormData({...formData, expirationDate: e.target.value})}
                    className="w-full glass p-4 rounded-2xl outline-none border border-transparent focus:border-purple-500/50 transition-all font-bold appearance-none bg-black/20 text-white"
                  />
               </div>
            </div>

            <div className="flex items-center gap-4 glass p-6 rounded-3xl border border-white/5">
                <div 
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                  className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 ${formData.isActive ? 'bg-emerald-500' : 'bg-white/10'}`}
                >
                   <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
                <div>
                   <span className="font-black text-xs uppercase tracking-[0.2em] text-white">Активность кода</span>
                   <p className="text-[10px] text-gray-500 font-bold">{formData.isActive ? 'Скидка действует' : 'Скидка отключена'}</p>
                </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-5 rounded-[28px] font-black text-lg shadow-2xl shadow-purple-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={20} />
                  <span>{promo ? 'Сохранить изменения' : 'Создать промо-код'}</span>
                </>
              )}
            </button>
        </form>
      </div>
    </div>
  );
}
