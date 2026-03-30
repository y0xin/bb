"use client";
import { useCart } from '@/context/useCart';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeItem, getTotalPrice } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md glass h-full shadow-2xl flex flex-col p-6 border-l border-white/10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <ShoppingBag /> Корзина
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <ShoppingBag size={48} className="mb-4 opacity-20" />
              <p>Корзина пуста</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 group">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden glass">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                  <p className="text-blue-500 font-bold">${item.price} x {item.quantity}</p>
                </div>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex justify-between items-center mb-6">
              <span className="text-muted-foreground font-medium">Итого:</span>
              <span className="text-3xl font-black">${getTotalPrice()}</span>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/30 transition-all active:scale-95">
              Оформить заказ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
