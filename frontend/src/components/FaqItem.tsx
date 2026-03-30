"use client";
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left font-bold text-lg hover:bg-white/5 transition-all outline-none"
      >
        <span className="pr-8">{q}</span>
        <ChevronDown size={20} className={`transition-transform duration-300 shrink-0 ${open ? 'rotate-180 text-blue-500' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-6 text-gray-500 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
          {a}
        </div>
      )}
    </div>
  );
}
