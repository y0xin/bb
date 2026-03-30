"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import { Banner } from '@/types';

interface HomeHeroProps {
  banners: Banner[];
}

export default function HomeHero({ banners }: HomeHeroProps) {
  // Use the first active hero banner if available, otherwise fallback to default
  const activeBanner = banners.find(b => b.isActive && b.position === 'hero') || {
    title: 'Качество и доверие в одном месте.',
    subtitle: 'Премиальный онлайн-каталог электроники и аксессуаров для вашего бизнеса и жизни.',
    image: ''
  };

  return (
    <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="inline-flex items-center space-x-3 bg-blue-600/10 border border-blue-500/20 px-6 py-2.5 rounded-full text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-2xl shadow-blue-500/5"
      >
        <Zap size={14} className="fill-blue-500" />
        <span>Новая коллекция 2026 уже в продаже</span>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <h1 className="text-7xl md:text-[140px] font-black mb-10 tracking-[-0.05em] leading-[0.85] uppercase italic text-white">
          {activeBanner.title.split(' ').map((word: string, i: number) => (
            <React.Fragment key={i}>
              {i === 2 && <br />}
              <span className={i % 3 === 2 ? "bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-emerald-400 to-indigo-500 animate-gradient-x text-glow" : ""}>
                {word}{' '}
              </span>
            </React.Fragment>
          ))}
        </h1>

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-16 font-medium leading-relaxed"
        >
          {activeBanner.subtitle}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link href="/catalog" className="w-full sm:w-auto bg-blue-600 text-white px-12 py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-3 transition-all hover:scale-105 hover:bg-blue-700 active:scale-95 shadow-2xl shadow-blue-500/40">
            <span>Перейти в каталог</span>
            <ArrowRight size={18} />
          </Link>
          <Link href="/portfolio" className="w-full sm:w-auto glass px-12 py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center text-white/70 hover:text-white">
            Наше портфолио
          </Link>
        </motion.div>
      </motion.div>

      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] animate-pulse delay-700" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="mt-24 flex items-center justify-center gap-12 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700"
      >
        <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
            <Star size={16} fill="currentColor" /> Trustpilot 4.9/5
        </div>
        <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
            <Star size={16} fill="currentColor" /> Google Reviews 5.0
        </div>
      </motion.div>
    </section>
  );
}
