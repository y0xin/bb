"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  ExternalLink,
  Tag,
  Check
} from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { Portfolio } from '@/types';
import Image from 'next/image';

export default function AdminPortfolio() {
  const [projects, setProjects] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Portfolio | null>(null);
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const res = await fetch(`${strapiUrl}/api/portfolios?populate=*&sort=createdAt:desc`);
      const { data } = await res.json();
      if (data) {
        setProjects(data.map((p: any) => ({
          ...p,
          id: p.id,
          image: p.image?.url ? `${strapiUrl}${p.image.url}` : '/placeholder-project.png'
        } as Portfolio)));
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
    if (!confirm('Удалить этот проект из портфолио?')) return;
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const res = await fetch(`${strapiUrl}/api/portfolios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.jwt}` }
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error('Delete error', e);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight text-white">Портфолио</h1>
          <p className="text-gray-500 font-medium">Управление кейсами и реализованными проектами</p>
        </div>
        <button 
          onClick={() => { setSelectedProject(null); setIsModalOpen(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30 text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-xl active:scale-95"
        >
          <Plus size={20} /> Добавить работу
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div key={project.id} className="glass rounded-[40px] border border-white/10 overflow-hidden group hover:border-emerald-500/30 transition-all duration-500 shadow-2xl">
             <div className="relative h-56 bg-white/5">
                <Image 
                  src={project.image as unknown as string} 
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                  alt={project.title} 
                />
                <div className="absolute top-4 left-4 glass bg-emerald-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/10">{project.tag}</div>
             </div>
             <div className="p-8">
                <h3 className="text-xl font-bold mb-3 text-white">{project.title}</h3>
                <p className="text-gray-400 text-sm mb-8 line-clamp-2 h-10">{project.description}</p>
                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => { setSelectedProject(project); setIsModalOpen(true); }}
                    className="flex-1 py-3 glass rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all text-white"
                   >
                      <Edit size={16} className="inline mr-2" /> Править
                   </button>
                   <button 
                    onClick={() => handleDelete(project.id)}
                    className="p-3 glass rounded-2xl text-red-500 hover:bg-red-500/10 transition-all"
                   >
                      <Trash2 size={18} />
                   </button>
                </div>
             </div>
          </div>
        ))}
        {!loading && projects.length === 0 && (
           <div className="col-span-full py-20 text-center glass rounded-[40px] border border-dashed border-white/10 opacity-30">
              <Plus size={48} className="mx-auto mb-4 text-white" />
              <p className="font-black uppercase tracking-widest text-xs text-white">Работы не найдены</p>
           </div>
        )}
      </div>

      {isModalOpen && (
        <PortfolioModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          project={selectedProject} 
          onSave={fetchData} 
        />
      )}
    </div>
  );
}

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Portfolio | null;
  onSave: () => void;
}

function PortfolioModal({ onClose, project, onSave }: PortfolioModalProps) {
  const [formData, setFormData] = useState<Partial<Portfolio>>(project || { title: '', description: '', tag: '', link: '' });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const url = project ? `${strapiUrl}/api/portfolios/${project.id}` : `${strapiUrl}/api/portfolios`;
      const res = await fetch(url, {
        method: project ? 'PUT' : 'POST',
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
      <div className="glass w-full max-w-2xl rounded-[50px] border border-white/10 overflow-hidden shadow-3xl">
        <header className="p-10 border-b border-white/5 flex justify-between items-center bg-emerald-600/5 text-white">
            <div>
               <h2 className="text-3xl font-black tracking-tight">{project ? 'Обновить проект' : 'Добавить проект'}</h2>
               <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Детали портфолио</p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all"><X /></button>
        </header>
        <form onSubmit={handleSave} className="p-10 space-y-8">
            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Название проекта</label>
                  <input 
                    type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="E-Commerce Redesign"
                    className="w-full glass p-5 rounded-[24px] outline-none border border-transparent focus:border-emerald-500/50 transition-all font-bold text-white bg-transparent"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Тег / Категория</label>
                  <div className="relative">
                    <input 
                      type="text" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})}
                      placeholder="Web Design"
                      className="w-full glass p-5 pl-12 rounded-[24px] outline-none border border-transparent focus:border-emerald-500/50 transition-all font-bold text-white bg-transparent"
                    />
                    <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
               </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Описание</label>
                <textarea 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full glass p-5 rounded-[24px] outline-none border border-transparent focus:border-emerald-500/50 transition-all font-medium h-32 text-white bg-transparent"
                  placeholder="Опишите масштаб проекта и вашу роль..."
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Ссылка на проект (External Link)</label>
                <div className="relative">
                  <input 
                    type="url" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})}
                    placeholder="https://example.com"
                    className="w-full glass p-5 pl-12 rounded-[24px] outline-none border border-transparent focus:border-emerald-500/50 transition-all font-bold text-white bg-transparent"
                  />
                  <ExternalLink size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-6 rounded-[28px] font-black text-xl shadow-2xl shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={24} />
                  <span>{project ? 'Обновить данные' : 'Опубликовать проект'}</span>
                </>
              )}
            </button>
        </form>
      </div>
    </div>
  );
}
