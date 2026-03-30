import Link from 'next/link';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-emerald-500 mb-4">
              PRO MARKET
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Современный онлайн-каталог. Качество и доверие в одном месте.
            </p>
          </div>

          {/* Ссылки */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-400">Страницы</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/catalog" className="hover:text-blue-500 transition-colors">Каталог</Link></li>
              <li><Link href="/portfolio" className="hover:text-blue-500 transition-colors">Портфолио</Link></li>
              <li><Link href="/faq" className="hover:text-blue-500 transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-blue-500 transition-colors">Контакты</Link></li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-400">Контакты</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Phone size={14} className="text-blue-500" /> +7 (999) 123-45-67</li>
              <li className="flex items-center gap-2"><Mail size={14} className="text-blue-500" /> info@promarket.ru</li>
              <li className="flex items-center gap-2"><MapPin size={14} className="text-blue-500" /> Москва</li>
            </ul>
          </div>

          {/* Рассылка */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-400">Новости</h4>
            <p className="text-sm text-gray-500 mb-4">Узнавайте первыми о акциях и новинках.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Ваш email"
                className="flex-1 glass px-4 py-3 rounded-l-xl outline-none text-sm focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-xl transition-all">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} PRO MARKET. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
