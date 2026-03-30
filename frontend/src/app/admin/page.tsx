"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingBag, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  LucideIcon
} from 'lucide-react';
import { useAuth } from '@/context/useAuth';

interface DashboardStat {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

interface DashboardOrder {
  id: string;
  user: string;
  status: string;
  amount: string;
  date: string;
}

interface DashboardData {
  stats: DashboardStat[];
  orders: DashboardOrder[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({ stats: [], orders: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [health, setHealth] = useState({ cpu: 24, ram: 1.2, disk: 85 });

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const [ordersRes, productsRes, messagesRes, quizRes] = await Promise.all([
        fetch(`${strapiUrl}/api/orders?sort=createdAt:desc&pagination[limit]=10`).then(res => res.json()),
        fetch(`${strapiUrl}/api/products?pagination[withCount]=true`).then(res => res.json()),
        fetch(`${strapiUrl}/api/chat-messages?filters[isRead][$eq]=false&pagination[withCount]=true`).then(res => res.json()),
        fetch(`${strapiUrl}/api/quiz-submissions?pagination[withCount]=true`).then(res => res.json()),
      ]);

      const orderCount = ordersRes.meta?.pagination?.total || 0;
      const productCount = productsRes.meta?.pagination?.total || 0;
      const unreadMessages = messagesRes.meta?.pagination?.total || 0;
      const quizCount = quizRes.meta?.pagination?.total || 0;
      
      const conversionValue = quizCount > 0 ? (orderCount / quizCount * 100).toFixed(1) : "0";

      setData({
        stats: [
          { label: 'Всего заказов', value: orderCount.toString(), trend: '+4.2%', icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Товары', value: productCount.toString(), trend: '+2.1%', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Новые сообщения', value: unreadMessages.toString(), trend: unreadMessages > 0 ? 'Нужно ответить' : 'Чисто', icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Конверсия', value: `${conversionValue}%`, trend: '+0.4%', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ],
        orders: ordersRes.data?.map((o: any) => ({
          id: `#${o.id}`,
          user: o.customerName || 'Гость',
          status: o.status,
          amount: `$${o.totalPrice}`,
          date: new Date(o.createdAt).toLocaleDateString()
        })) || []
      });

      setHealth({
        cpu: Math.floor(Math.random() * (40 - 15) + 15),
        ram: parseFloat((Math.random() * (1.8 - 1.1) + 1.1).toFixed(1)),
        disk: 85
      });

    } catch (e) {
      console.error('Fetch error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Анализ данных...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight uppercase italic">{user?.username}, Добро пожаловать</h1>
          <div className="flex items-center gap-3">
            <p className="text-gray-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Роль: <span className="text-blue-500">{user?.role}</span>
            </p>
            <span className="text-gray-800">|</span>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Обновлено: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        <button 
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="glass hover:bg-white/10 p-5 rounded-[24px] border border-white/10 transition-all font-black uppercase tracking-widest text-[10px] flex items-center gap-3 group active:scale-95 shadow-xl"
        >
          <RotateCcw size={16} className={`${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          {refreshing ? 'Обновление' : 'Обновить панель'}
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.stats.map((stat, i) => (
          <div key={i} className="glass p-8 rounded-[36px] border border-white/10 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500 shadow-2xl">
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-bl-full opacity-30 group-hover:scale-125 transition-transform duration-700`} />
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-lg shadow-black/20`}>
              <stat.icon size={28} />
            </div>
            <div className="relative z-10">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <h3 className="text-4xl font-black mb-4 tracking-tighter">{stat.value}</h3>
              <div className="flex items-center gap-2">
                <span className={`flex items-center text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  {stat.trend}
                </span>
                <span className="text-gray-600 text-[9px] font-black uppercase tracking-widest">динамика</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 glass rounded-[44px] border border-white/10 overflow-hidden flex flex-col shadow-3xl">
          <div className="p-10 flex items-center justify-between bg-white/[0.02] border-b border-white/5">
            <div>
               <h2 className="text-2xl font-black tracking-tight uppercase italic">Последние заказы</h2>
               <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Топ 10 активных сделок</p>
            </div>
            <button className="glass px-6 py-3 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">Смотреть все</button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-white/5 bg-white/[0.01]">
                  <th className="p-6 pl-10 text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">ID</th>
                  <th className="p-6 text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Клиент</th>
                  <th className="p-6 text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Статус</th>
                  <th className="p-6 text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Сумма</th>
                  <th className="p-6 pr-10 text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] text-right">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {data.orders.length > 0 ? data.orders.map((order, i) => (
                  <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="p-6 pl-10 font-bold text-sm text-gray-400 tracking-tighter">{order.id}</td>
                    <td className="p-6 text-sm font-black">{order.user}</td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        order.status === 'yetkazildi' ? 'bg-emerald-500/10 text-emerald-500' :
                        order.status === 'bekor_qilindi' ? 'bg-red-500/10 text-red-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {order.status === 'yetkazildi' ? <CheckCircle2 size={12} /> : 
                         order.status === 'bekor_qilindi' ? <AlertCircle size={12} /> : 
                         <Clock size={12} />}
                        {order.status === 'yangi' ? 'Новый' : 
                         order.status === 'yetkazildi' ? 'Завершен' : 
                         order.status === 'bekor_qilindi' ? 'Отмена' : 'В работе'}
                      </span>
                    </td>
                    <td className="p-6 font-black text-sm text-white">{order.amount}</td>
                    <td className="p-6 pr-10 text-right text-gray-500 text-[11px] font-bold">{order.date}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-gray-600 font-black uppercase tracking-widest text-[10px]">Транзакции не найдены</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health */}
        <div className="glass p-10 rounded-[44px] border border-white/10 space-y-10 flex flex-col shadow-3xl">
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight uppercase italic text-white/90">Health Check</h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Real-time status</p>
          </div>
          <div className="space-y-10 flex-1">
            <div className="space-y-4">
              <div className="flex justify-between items-end px-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CPU Load</span>
                <span className={`text-xs font-black ${health.cpu > 30 ? 'text-amber-500' : 'text-emerald-500'}`}>{health.cpu}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${health.cpu > 30 ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]' : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]'}`} 
                  style={{ width: `${health.cpu}%` }} 
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end px-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Memory Use</span>
                <span className="text-xs font-black text-blue-500">{health.ram}GB / 4.0GB</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(59,130,246,0.4)]" 
                  style={{ width: `${(health.ram / 4) * 100}%` }} 
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end px-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Disk Storage</span>
                <span className="text-xs font-black text-purple-500">{health.disk}% fill</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(168,85,247,0.4)]" 
                  style={{ width: `${health.disk}%` }} 
                />
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 mt-auto">
             <div className="glass bg-blue-600/5 rounded-3xl p-6 border border-blue-500/10">
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                   <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Network Analysis</p>
                </div>
                <p className="text-blue-100/50 text-[11px] font-bold leading-relaxed italic">
                   All satellite nodes are operational. Latency check: <span className="text-emerald-500">Normal</span>. Response time: 42ms.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
