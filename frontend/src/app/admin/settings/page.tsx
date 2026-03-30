"use client";
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Layout,
  Send as TelegramIcon,
  Check
} from 'lucide-react';
import { useAuth } from '@/context/useAuth';

interface SiteSettings {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  telegram: string;
  instagram: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'PRO MARKET',
    contactEmail: 'info@promarket.ru',
    contactPhone: '+7 (900) 123-45-67',
    address: '',
    telegram: '',
    instagram: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const fetchSettings = async () => {
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const res = await fetch(`${strapiUrl}/api/site-config`);
      const { data } = await res.json();
      if (data) setSettings(data as SiteSettings);
    } catch (e) {
      console.error('Fetch settings error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const res = await fetch(`${strapiUrl}/api/site-config`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.jwt}` 
        },
        body: JSON.stringify({ data: settings })
      });
      if (res.ok) {
        alert('Настройки успешно сохранены!');
      }
    } catch (e) {
      console.error('Save error', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-[400px] flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight uppercase italic">Настройки платформы</h1>
          <p className="text-gray-500 font-medium">Глобальные параметры и контактные данные</p>
        </div>
      </header>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass p-8 rounded-[40px] border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full" />
              <div className="flex items-center gap-4 mb-4 relative z-10">
                 <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                    <Layout size={24} />
                 </div>
                 <h2 className="text-xl font-black italic">Конфигурация</h2>
              </div>
              
              <div className="space-y-2 relative z-10">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Название сайта</label>
                 <div className="relative">
                   <input 
                    type="text" value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})}
                    className="w-full glass p-4 pl-12 rounded-2xl outline-none border border-transparent focus:border-blue-500/50 transition-all font-bold text-white bg-transparent shadow-inner"
                   />
                   <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                 </div>
              </div>

              <div className="space-y-2 relative z-10">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Физический адрес</label>
                <div className="relative">
                  <textarea 
                    value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})}
                    className="w-full glass p-4 pl-12 rounded-2xl outline-none border border-transparent focus:border-blue-500/50 transition-all font-medium h-24 text-white bg-transparent shadow-inner"
                    placeholder="г. Самарканд, ул. Регистан..."
                  />
                  <MapPin size={18} className="absolute left-4 top-6 text-gray-500" />
                </div>
              </div>
           </div>

           <div className="glass p-8 rounded-[40px] border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full" />
              <div className="flex items-center gap-4 mb-4 relative z-10">
                 <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                    <Mail size={24} />
                 </div>
                 <h2 className="text-xl font-black italic">Обратная связь</h2>
              </div>

              <div className="space-y-2 relative z-10">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Email отдела продаж</label>
                 <input 
                  type="email" value={settings.contactEmail} onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                  className="w-full glass p-4 rounded-2xl outline-none border border-transparent focus:border-emerald-500/50 transition-all font-bold text-white bg-transparent shadow-inner"
                 />
              </div>

              <div className="space-y-2 relative z-10">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Горячая линия</label>
                 <div className="relative">
                    <input 
                      type="text" value={settings.contactPhone} onChange={e => setSettings({...settings, contactPhone: e.target.value})}
                      className="w-full glass p-4 pl-12 rounded-2xl outline-none border border-transparent focus:border-emerald-500/50 transition-all font-bold text-white bg-transparent shadow-inner"
                    />
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                 </div>
              </div>
           </div>

           <div className="glass p-8 rounded-[40px] border border-white/10 space-y-6 shadow-2xl md:col-span-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-bl-full" />
              <div className="flex items-center gap-4 mb-4 relative z-10">
                 <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
                    <TelegramIcon size={24} />
                 </div>
                 <h2 className="text-xl font-black italic">Социальное присутствие</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Telegram (Public Channel)</label>
                    <div className="relative">
                       <input 
                        type="text" value={settings.telegram} onChange={e => setSettings({...settings, telegram: e.target.value})}
                        className="w-full glass p-4 pl-12 rounded-2xl outline-none border border-transparent focus:border-purple-500/50 transition-all font-bold text-white bg-transparent shadow-inner"
                        placeholder="t.me/yourbrand"
                       />
                       <TelegramIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Instagram (Official Feed)</label>
                    <div className="relative">
                       <input 
                        type="text" value={settings.instagram} onChange={e => setSettings({...settings, instagram: e.target.value})}
                        className="w-full glass p-4 pl-12 rounded-2xl outline-none border border-transparent focus:border-purple-500/50 transition-all font-bold text-white bg-transparent shadow-inner"
                        placeholder="instagram.com/yourbrand"
                       />
                       <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <button 
          type="submit" disabled={saving}
          className="w-full max-w-sm mx-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-6 rounded-3xl font-black text-xl shadow-3xl shadow-blue-500/40 transition-all active:scale-95 flex items-center justify-center gap-4 group"
        >
          {saving ? (
            <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save size={24} className="group-hover:scale-110 transition-transform" />
              <span className="tracking-[0.1em] uppercase">Сохранить всё</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
