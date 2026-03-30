"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  MessageSquare, 
  HelpCircle, 
  LogOut,
  Briefcase,
  Layers,
  Zap,
  Tag
} from 'lucide-react';
import { useAuth } from '@/context/useAuth';

const sidebarItems: { label: string; href: string; icon: any; roles: string[] }[] = [
  { label: 'Панель', href: '/admin', icon: LayoutDashboard, roles: ['Superadmin', 'Manager', 'Editor', 'Moderator'] },
  { label: 'Заказы', href: '/admin/orders', icon: ShoppingBag, roles: ['Superadmin', 'Manager'] },
  { label: 'Каталог', href: '/admin/catalog', icon: Layers, roles: ['Superadmin', 'Manager', 'Editor'] },
  { label: 'Чат', href: '/admin/chat', icon: MessageSquare, roles: ['Superadmin', 'Moderator'] },
  { label: 'Баннеры', href: '/admin/banners', icon: Zap, roles: ['Superadmin', 'Editor'] },
  { label: 'Промо-коды', href: '/admin/promo-codes', icon: Tag, roles: ['Superadmin', 'Manager'] },
  { label: 'Вопросы/FAQ', href: '/admin/faq', icon: HelpCircle, roles: ['Superadmin', 'Editor', 'Moderator'] },
  { label: 'Портфолио', href: '/admin/portfolio', icon: Briefcase, roles: ['Superadmin', 'Editor'] },
  { label: 'Пользователи', href: '/admin/users', icon: Users, roles: ['Superadmin'] },
  { label: 'Настройки', href: '/admin/settings', icon: Settings, roles: ['Superadmin'] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, login, logout } = useAuth();
  const router = useRouter();
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [formData, setFormData] = React.useState({ identifier: '', password: '', username: '', email: '' });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const endpoint = isRegistering ? '/api/auth/local/register' : '/api/auth/local';
      
      const res = await fetch(`${strapiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegistering ? {
          username: formData.username,
          email: formData.email,
          password: formData.password
        } : {
          identifier: formData.identifier,
          password: formData.password
        }),
      });
      const data = await res.json();
      if (data.jwt) {
        login({ user: data.user, jwt: data.jwt });
      } else {
        setError(data.error?.message || 'Ошибка авторизации');
      }
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center p-6 transition-all font-sans">
        <div className="glass p-12 rounded-[40px] border border-white/10 max-w-md w-full shadow-3xl">
          <div className="flex justify-center mb-8">
             <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40">
                <Layers className="text-white" size={32} />
             </div>
          </div>
          <h1 className="text-4xl font-black mb-2 text-center tracking-tight">
            {isRegistering ? 'Регистрация' : 'Вход'}
          </h1>
          <p className="text-gray-500 text-center text-sm font-medium mb-8">
            {isRegistering ? 'Создайте аккаунт для управления магазином' : 'Добро пожаловать в панель управления'}
          </p>

          {error && <p className="text-red-500 text-sm mb-6 font-bold bg-red-500/10 p-4 rounded-2xl border border-red-500/20">{error}</p>}
          
          <form onSubmit={handleAuth} className="space-y-5 mb-8">
            {isRegistering && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Имя пользователя</label>
                <input 
                  type="text" 
                  required
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  placeholder="manager_name" 
                  className="w-full glass p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold placeholder:text-white/20" 
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                {isRegistering ? 'Email адрес' : 'Логин / Email'}
              </label>
              <input 
                type={isRegistering ? "email" : "text"}
                required
                value={isRegistering ? formData.email : formData.identifier}
                onChange={e => isRegistering 
                  ? setFormData({...formData, email: e.target.value})
                  : setFormData({...formData, identifier: e.target.value})
                }
                placeholder={isRegistering ? "admin@mail.uz" : "admin"} 
                className="w-full glass p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold placeholder:text-white/20" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Пароль</label>
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••" 
                className="w-full glass p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold placeholder:text-white/20" 
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/30 transition-all active:scale-95 group"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                   <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                   <span>Обработка...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                   <span>{isRegistering ? 'Создать аккаунт' : 'Войти в систему'}</span>
                   <Briefcase size={20} className="group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          <div className="text-center">
             <button 
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm font-bold text-gray-400 hover:text-white transition-colors"
             >
                {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/10 p-6 flex flex-col glass backdrop-blur-xl">
        <div className="mb-12 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl" />
          <h1 className="font-black text-2xl tracking-tight uppercase">Admin</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {sidebarItems.filter(item => item.roles.includes(user.role)).map(item => (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-4 rounded-2xl transition-all border border-transparent ${
                pathname === item.href 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-bold">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6 p-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full" />
            <div>
              <p className="font-bold text-sm">{user.username}</p>
              <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={() => { logout(); router.push('/admin'); }}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold"
          >
            <LogOut size={20} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
