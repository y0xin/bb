import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="min-h-screen hero-gradient flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 flex-1">
        <h1 className="text-5xl font-black mb-4 text-center">Свяжитесь с нами</h1>
        <p className="text-center text-gray-500 mb-16">Есть вопросы? Мы всегда готовы помочь.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="glass p-10 rounded-3xl border border-white/10">
            <h2 className="text-2xl font-bold mb-8">Отправить сообщение</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Имя</label>
                <input type="text" placeholder="Ваше имя" className="w-full glass p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Email</label>
                <input type="email" placeholder="email@example.com" className="w-full glass p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Сообщение</label>
                <textarea rows={5} placeholder="Напишите ваше сообщение..." className="w-full glass p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none" />
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                Отправить
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="glass p-8 rounded-3xl border border-white/10 flex items-start gap-5 hover:border-blue-500/30 transition-all">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                <Phone />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Телефон</h3>
                <p className="text-gray-500">+7 (999) 123-45-67</p>
                <p className="text-gray-500">+7 (495) 200-00-00</p>
              </div>
            </div>
            <div className="glass p-8 rounded-3xl border border-white/10 flex items-start gap-5 hover:border-emerald-500/30 transition-all">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                <Mail />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Email</h3>
                <p className="text-gray-500">info@promarket.ru</p>
                <p className="text-gray-500">support@promarket.ru</p>
              </div>
            </div>
            <div className="glass p-8 rounded-3xl border border-white/10 flex items-start gap-5 hover:border-purple-500/30 transition-all">
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500 shrink-0">
                <MapPin />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Адрес</h3>
                <p className="text-gray-500">Москва, ул. Тверская, 1</p>
              </div>
            </div>
            <div className="glass p-8 rounded-3xl border border-white/10 flex items-start gap-5 hover:border-yellow-500/30 transition-all">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-yellow-500 shrink-0">
                <MessageCircle />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Telegram</h3>
                <p className="text-gray-500">@promarket_ru</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
