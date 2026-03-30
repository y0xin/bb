"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import HomeHero from '@/components/HomeHero';
import Footer from '@/components/Footer';
import { Shield, Truck, Zap } from 'lucide-react';
import { Banner } from '@/types';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

const features = [
  { icon: Truck, title: 'Доставка 24/7', desc: 'Бесплатная экспресс-доставка по всей стране.', color: 'blue' },
  { icon: Shield, title: 'Гарантия 2 года', desc: 'Официальный сервис и поддержка клиентов.', color: 'emerald' },
  { icon: Zap, title: 'Безопасная оплата', desc: 'Защищенные транзакции и кэшбэк до 10%.', color: 'purple' }
];

interface StrapiBanner {
  id: number;
  title: string;
  subtitle?: string;
  image?: { url: string };
  isActive: boolean;
  sortOrder: number;
  position: Banner['position'];
}

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([]);

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch(`${STRAPI_URL}/api/banners?filters[isActive][$eq]=true&sort=sortOrder:asc`);
      const { data } = await res.json();
      if (data) {
        setBanners(data.map((b: StrapiBanner) => ({
          ...b,
          id: b.id,
          image: b.image?.url ? `${STRAPI_URL}${b.image.url}` : ''
        } as Banner)));
      }
    } catch (e) {
      console.error('Banners fetch error', e);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  return (
    <main className="min-h-screen hero-gradient overflow-hidden flex flex-col text-white">
      <Navbar />
      
      <HomeHero banners={banners} />

      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 relative z-10">
        {features.map((f, i) => (
          <div 
            key={i}
            className="glass p-10 rounded-[40px] border border-white/5 hover:border-white/20 transition-all group cursor-default shadow-3xl animate-in slide-in-from-bottom-4 duration-700"
            style={{ animationDelay: `${0.1 * (i + 1)}s` }}
          >
            <div className={`w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 text-blue-400 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 shadow-xl shadow-blue-500/5`}>
              <f.icon size={28} />
            </div>
            <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase italic">{f.title}</h3>
            <p className="text-gray-500 font-medium leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      <Footer />
    </main>
  );
}
