"use client";
import Navbar from '@/components/Navbar';
import React, { useState, useMemo, useCallback } from 'react';
import { ShoppingBag, CreditCard, Truck, Tag, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/useCart';
import Link from 'next/link';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  }, [items]);

  const discount = isPromoApplied ? subtotal * (discountPercent / 100) : 0;
  const total = subtotal - discount;

  const handleApplyPromo = useCallback(async () => {
    if (!promoCode.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${STRAPI_URL}/api/promo-codes?filters[code][$eq]=${promoCode.trim().toUpperCase()}&filters[isActive][$eq]=true`);
      const { data } = await res.json();
      
      if (data && data.length > 0) {
        setDiscountPercent(data[0].discountPercent);
        setIsPromoApplied(true);
      } else {
        alert('Неверный или неактивный промокод');
        setIsPromoApplied(false);
        setDiscountPercent(0);
      }
    } catch (e) {
      console.error('Promo error', e);
      alert('Ошибка при проверке промокода');
    } finally {
      setLoading(false);
    }
  }, [promoCode]);

  const handlePlaceOrder = useCallback(async () => {
    if (items.length === 0) return;
    if (!formData.name || !formData.phone) {
      alert('Пожалуйста, заполните основные данные (Имя и Телефон)');
      return;
    }
    
    setLoading(true);
    try {
      // Create order in Strapi
      const orderRes = await fetch(`${STRAPI_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            customerName: formData.name,
            phone: formData.phone,
            address: formData.address,
            items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
            total: total,
            status: 'pending',
            date: new Date(),
            promoCode: isPromoApplied ? promoCode : null
          }
        })
      });

      if (orderRes.ok) {
        setOrderPlaced(true);
        clearCart();
        
        // Optional: Telegram Notification via Edge Function or Backend
        await fetch('/api/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name, 
            phone: formData.phone,
            address: formData.address,
            items: items,
            total: total,
            promoCode: isPromoApplied ? promoCode : null
          })
        }).catch(err => console.error('Telegram notification error', err));
      } else {
        alert('Ошибка при оформлении заказа. Попробуйте снова.');
      }
    } catch (e) {
      console.error('Order placement failed', e);
      alert('Произошла ошибка. Пожалуйста, свяжитесь с поддержкой.');
    } finally {
      setLoading(false);
    }
  }, [formData, items, total, isPromoApplied, promoCode, clearCart]);

  if (orderPlaced) {
    return (
      <main className="min-h-screen hero-gradient flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="glass p-16 rounded-[48px] border border-white/10 shadow-3xl max-w-lg w-full animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-500/20">
            <CheckCircle2 size={48} className="text-emerald-500" />
          </div>
          <h1 className="text-5xl font-black mb-6 tracking-tighter uppercase italic">Заказ принят!</h1>
          <p className="text-gray-400 font-medium mb-10 leading-relaxed">Спасибо за покупку в PRO MARKET. Наш менеджer свяжется с вами в течение 15 минут для подтверждения заказа.</p>
          <button 
            onClick={() => window.location.href = '/catalog'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[32px] font-black transition-all text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 active:scale-95"
          >
            Вернуться в магазин
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen hero-gradient pb-20 text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 pt-16 animate-in fade-in duration-700">
        <div className="flex items-center justify-between mb-16">
            <div className="space-y-2">
                <Link href="/catalog" className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors text-[10px] font-black uppercase tracking-widest mb-4 group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Назад в каталог
                </Link>
                <h1 className="text-6xl font-black tracking-tighter uppercase italic">Оформление</h1>
            </div>
            <div className="hidden md:flex items-center gap-4 opacity-30">
                <ShoppingBag size={48} />
                <div className="h-px w-20 bg-white/20" />
                <Truck size={48} />
                <div className="h-px w-20 bg-white/20" />
                <CreditCard size={48} />
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-10">
            <div className="glass p-10 rounded-[40px] border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-black mb-10 flex items-center gap-4 uppercase tracking-tight">
                 <div className="w-10 h-10 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
                    <Truck size={20} />
                 </div>
                 Данные доставки
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Ваше Имя</label>
                  <input 
                    type="text" 
                    placeholder="Иван Иванов" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full glass p-5 rounded-3xl outline-none border border-transparent focus:border-blue-500/50 transition-all font-bold text-white bg-transparent" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Телефон</label>
                  <input 
                    type="tel" 
                    placeholder="+998" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full glass p-5 rounded-3xl outline-none border border-transparent focus:border-blue-500/50 transition-all font-bold text-white bg-transparent" 
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Адрес (город, улица, дом)</label>
                  <input 
                    type="text" 
                    placeholder="Ташкент, ул. Навои, 1" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full glass p-5 rounded-3xl outline-none border border-transparent focus:border-blue-500/50 transition-all font-bold text-white bg-transparent" 
                  />
                </div>
              </div>
            </div>

            <div className="glass p-10 rounded-[40px] border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-black mb-10 flex items-center gap-4 uppercase tracking-tight">
                 <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                    <CreditCard size={20} />
                 </div>
                 Способ оплаты
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <button className="glass p-6 rounded-[28px] border-2 border-blue-600 bg-blue-600/10 transition-all font-black uppercase tracking-widest text-[10px]">Платежная карта</button>
                <button className="glass p-6 rounded-[28px] border-2 border-transparent hover:border-white/10 transition-all font-black uppercase tracking-widest text-[10px] text-gray-500">Наличные</button>
                <button className="glass p-6 rounded-[28px] border-2 border-transparent hover:border-white/10 transition-all font-black uppercase tracking-widest text-[10px] text-gray-500">Рассрочка</button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="glass p-10 rounded-[44px] border border-white/10 sticky top-32 shadow-3xl">
              <h2 className="text-3xl font-black mb-10 tracking-tighter uppercase italic">Ваш чек</h2>
              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center text-gray-400">
                  <span className="text-xs font-black uppercase tracking-widest">Товары ({items.length}):</span>
                  <span className="text-xl font-black text-white">${subtotal}</span>
                </div>
                {isPromoApplied && (
                  <div className="flex justify-between items-center text-emerald-500">
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Скидка {discountPercent}%:</span>
                    <span className="text-xl font-black">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-gray-400">
                  <span className="text-xs font-black uppercase tracking-widest">Доставка:</span>
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Бесплатно</span>
                </div>
                
                <div className="pt-8 border-t border-white/10">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block px-2">Промокод</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="ENTER CODE" 
                      className="flex-1 glass p-4 rounded-2xl outline-none border border-transparent focus:border-blue-500/50 transition-all text-sm font-black uppercase tracking-widest bg-transparent" 
                    />
                    <button 
                      onClick={handleApplyPromo}
                      disabled={loading}
                      className="glass p-4 rounded-2xl border border-white/10 hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all shadow-xl"
                    >
                      <Tag size={20} />
                    </button>
                  </div>
                </div>

                <div className="pt-10 border-t border-white/10 flex justify-between items-end">
                  <span className="text-xl font-black uppercase tracking-tighter italic">Всего</span>
                  <span className="text-5xl font-black tracking-tight text-white">${total.toFixed(2)}</span>
                </div>
              </div>
              <button 
                onClick={handlePlaceOrder}
                disabled={items.length === 0 || loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-800 disabled:opacity-30 text-white py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {loading ? <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : "Оформить заказ"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
