"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  HelpCircle,
  X,
  Check,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { FAQ } from '@/types';

export default function AdminFAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const res = await fetch(`${strapiUrl}/api/faqs?sort=category:asc`);
      const { data } = await res.json();
      if (data) setFaqs(data);
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
    if (!confirm('Удалить этот вопрос?')) return;
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const res = await fetch(`${strapiUrl}/api/faqs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.jwt}` }
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error('Delete error', e);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight text-white">База знаний (FAQ)</h1>
          <p className="text-gray-500 font-medium">Управление ответами на частые вопросы пользователей</p>
        </div>
        <button 
          onClick={() => { setSelectedFaq(null); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-xl shadow-blue-500/30 active:scale-95"
        >
          <Plus size={20} /> Добавить вопрос
        </button>
      </header>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="glass rounded-[32px] border border-white/5 p-8 hover:border-blue-500/20 transition-all duration-500 group">
             <div className="flex items-start justify-between gap-6">
                <div className="flex gap-6 items-start">
                   <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                      <HelpCircle size={28} />
                   </div>
                   <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/5 px-3 py-1 rounded-full border border-blue-500/10">{faq.category}</span>
                        <h3 className="text-xl font-black tracking-tight text-white">{faq.question}</h3>
                      </div>
                      <p className="text-gray-400 font-medium leading-relaxed max-w-3xl">{faq.answer}</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => { setSelectedFaq(faq); setIsModalOpen(true); }}
                    className="p-3 glass rounded-xl text-blue-400 hover:bg-blue-500/10 transition-all sm:opacity-0 group-hover:opacity-100"
                   >
                      <Edit size={18} />
                   </button>
                   <button 
                    onClick={() => handleDelete(faq.id)}
                    className="p-3 glass rounded-xl text-red-500 hover:bg-red-500/10 transition-all sm:opacity-0 group-hover:opacity-100"
                   >
                      <Trash2 size={18} />
                   </button>
                </div>
             </div>
          </div>
        ))}
        {!loading && faqs.length === 0 && (
           <div className="py-20 text-center glass rounded-[40px] border border-dashed border-white/10 opacity-30">
              <HelpCircle size={48} className="mx-auto mb-4" />
              <p className="font-black uppercase tracking-widest text-xs">Вопросы не найдены</p>
           </div>
        )}
      </div>

      {isModalOpen && (
        <FaqModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          faq={selectedFaq} 
          onSave={fetchData} 
        />
      )}
    </div>
  );
}

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  faq: FAQ | null;
  onSave: () => void;
}

function FaqModal({ onClose, faq, onSave }: FaqModalProps) {
  const [formData, setFormData] = useState<Partial<FAQ>>(faq || { question: '', answer: '', category: 'Общее' });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const url = faq ? `${strapiUrl}/api/faqs/${faq.id}` : `${strapiUrl}/api/faqs`;
      const res = await fetch(url, {
        method: faq ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.jwt}`
        },
        body: JSON.stringify({ data: formData })
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="glass w-full max-w-2xl rounded-[50px] border border-white/10 overflow-hidden shadow-3xl">
        <header className="p-10 border-b border-white/5 flex justify-between items-center text-white">
            <h2 className="text-3xl font-black tracking-tight">{faq ? 'Изменить ответ' : 'Новый вопрос'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X /></button>
        </header>
        <form onSubmit={handleSave} className="p-10 space-y-8">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Категория</label>
                <div className="relative">
                  <select 
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as FAQ['category']})}
                    className="w-full glass p-5 rounded-[24px] outline-none border border-transparent focus:border-blue-500/50 transition-all font-bold appearance-none bg-black/40 text-white"
                  >
                    <option value="Общее">Общее</option>
                    <option value="Оплата">Оплата</option>
                    <option value="Доставка">Доставка</option>
                    <option value="Гарантия">Гарантия</option>
                    <option value="Возврат">Возврат</option>
                  </select>
                  <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Текст вопроса</label>
                <input 
                  type="text" required value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})}
                  placeholder="Как работает доставка?"
                  className="w-full glass p-6 rounded-[24px] outline-none border border-transparent focus:border-blue-500/50 transition-all font-black text-xl text-white bg-transparent"
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Текст ответа</label>
                <textarea 
                  required value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})}
                  className="w-full glass p-6 rounded-[24px] outline-none border border-transparent focus:border-blue-500/50 transition-all font-medium h-48 leading-relaxed text-white bg-transparent"
                  placeholder="Подробно распишите ответ..."
                />
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-6 rounded-[32px] font-black text-xl shadow-2xl shadow-blue-500/40 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={26} />
                  <span>Сохранить в FAQ</span>
                </>
              )}
            </button>
        </form>
      </div>
    </div>
  );
}
