"use client";
import Link from 'next/link';
import { ShoppingCart, Heart, Search, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import CartDrawer from './CartDrawer';
import { useCart } from '@/context/useCart';
import { useAuth } from '@/context/useAuth';

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItems = useCart(state => state.items);
  const { user, logout } = useAuth();
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full glass border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-emerald-500">
            PRO MARKET
          </Link>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link href="/catalog" className="hover:text-blue-500 transition-colors">Каталог</Link>
            <Link href="/portfolio" className="hover:text-blue-500 transition-colors">Портфолио</Link>
            <Link href="/faq" className="hover:text-blue-500 transition-colors">Частые вопросы</Link>
            <Link href="/contact" className="hover:text-blue-500 transition-colors">Контакты</Link>
          </div>

          <div className="flex items-center space-x-5">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
              <Search size={20} />
            </button>
            <Link href="/compare" className="p-2 hover:bg-white/10 rounded-lg transition-all">
              <Heart size={20} />
            </Link>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-all relative"
            >
              <ShoppingCart size={20} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartItems.length}
                </span>
              )}
            </button>
            {user ? (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/admin" 
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg px-4 flex items-center space-x-2 transition-all"
                >
                  <User size={18} />
                  <span className="text-sm font-bold">{user.username}</span>
                </Link>
                <button 
                  onClick={() => logout()}
                  className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg px-2 transition-all flex items-center"
                  title="Выйти"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link 
                href="/admin"
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 flex items-center space-x-2 transition-all"
              >
                <User size={18} />
                <span className="text-sm">Войти</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
