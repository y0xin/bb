"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  CheckCircle2, 
  Download,
  X,
  User,
  Phone,
  MapPin,
  Tag
} from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { Order } from '@/types';

interface OrderDisplay extends Partial<Order> {
  id: number;
  displayId: string;
  user: string;
  phone: string;
  address: string;
  status: Order['status'];
  amount: string;
  date: string;
  itemsCount: number;
  items: any[];
  promoCode: string;
}

const statusColors: Record<Order['status'], string> = {
  'yangi': 'bg-blue-500/10 text-blue-500',
  'tasdiqlangan': 'bg-amber-500/10 text-amber-500',
  'yetkazilmoqda': 'bg-purple-500/10 text-purple-500',
  'yetkazildi': 'bg-emerald-500/10 text-emerald-500',
  'bekor_qilindi': 'bg-red-500/10 text-red-500',
};

const statusLabels: Record<Order['status'], string> = {
  'yangi': 'Новый',
  'tasdiqlangan': 'Обработка',
  'yetkazilmoqda': 'Отгружен',
  'yetkazildi': 'Доставлен',
  'bekor_qilindi': 'Отменен',
};

export default function AdminOrders() {
  const [filter, setFilter] = useState('Все');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<OrderDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDisplay | null>(null);
  const { user } = useAuth();

  const fetchOrders = useCallback(async () => {
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const res = await fetch(`${strapiUrl}/api/orders?sort=createdAt:desc&pagination[limit]=100`);
      const { data } = await res.json();
      if (data) {
        setOrders(data.map((o: any) => ({
           id: o.id,
           displayId: `#${o.id}`,
           user: o.customerName || 'Гость',
           phone: o.customerPhone || 'Нет номера',
           address: o.customerAddress || 'Самовывоз',
           status: o.status,
           amount: `$${o.totalPrice}`,
           date: new Date(o.createdAt).toLocaleString(),
           itemsCount: o.items?.length || 0,
           items: o.items || [],
           promoCode: o.promoCode || 'Нет'
        } as OrderDisplay)));
      }
    } catch (e) {
      console.error('Fetch error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      await fetch(`${strapiUrl}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.jwt}`
        },
        body: JSON.stringify({ data: { status: newStatus } })
      });
      await fetchOrders();
      // Update selected order view if it's the one we're editing
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (e) {
      console.error('Update redundant', e);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Phone', 'Status', 'Amount', 'Date'];
    const rows = filteredOrders.map(o => [o.displayId, o.user, o.phone, statusLabels[o.status] || o.status, o.amount, o.date]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(r => r.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'All' || filter === 'Все' || statusLabels[o.status] === filter;
    const matchesSearch = o.user.toLowerCase().includes(search.toLowerCase()) || o.displayId.includes(search);
    return matchesFilter && matchesSearch;
  });
  
  if (loading) return (
    <div className="p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
       <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
       <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Загрузка заказов...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight text-white">Управление заказами</h1>
          <p className="text-gray-500 font-medium">Мониторинг, смена статусов и отчетность в реальном времени</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="glass px-8 py-4 rounded-2xl border border-white/10 flex items-center gap-3 font-bold hover:bg-white/10 transition-all text-sm active:scale-95 shadow-xl text-white"
        >
          <Download size={18} className="text-blue-400" /> Скачать отчет (CSV)
        </button>
      </header>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex flex-wrap gap-2 p-2 bg-white/5 rounded-3xl border border-white/10 w-fit">
          {['Все', 'Новый', 'Обработка', 'Отгружен', 'Доставлен', 'Отменен'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === tab ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Поиск по имени или ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass pl-12 pr-4 py-4 rounded-3xl border border-white/10 group-hover:border-white/20 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm text-white bg-transparent"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-6 text-[10px] text-gray-500 uppercase font-black tracking-widest pl-10">ID</th>
                <th className="p-6 text-[10px] text-gray-500 uppercase font-black tracking-widest">Клиент</th>
                <th className="p-6 text-[10px] text-gray-500 uppercase font-black tracking-widest">Статус</th>
                <th className="p-6 text-[10px] text-gray-500 uppercase font-black tracking-widest">Товары</th>
                <th className="p-6 text-[10px] text-gray-500 uppercase font-black tracking-widest">Сумма</th>
                <th className="p-6 text-[10px] text-gray-500 uppercase font-black tracking-widest text-right">Дата</th>
                <th className="p-6 text-[10px] text-gray-500 uppercase font-black tracking-widest text-right pr-10">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((order, i) => (
                <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="p-6 font-bold text-sm pl-10 text-gray-400">{order.displayId}</td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white">{order.user}</span>
                      <span className="text-[10px] text-gray-500 font-bold">{order.phone}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusColors[order.status] || 'bg-gray-500/10 text-gray-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'yangi' ? 'bg-blue-500 animate-pulse' : 'bg-current'}`} />
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="p-6 text-sm text-gray-400 font-medium">{order.itemsCount} шт.</td>
                  <td className="p-6 font-black text-sm text-blue-400">{order.amount}</td>
                  <td className="p-6 text-right text-gray-500 text-xs font-bold">{order.date}</td>
                  <td className="p-6 text-right pr-10">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2.5 bg-white/5 text-gray-400 hover:text-white hover:bg-blue-600 rounded-xl transition-all shadow-lg" 
                        title="Просмотр"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-20 text-center text-gray-500 font-black uppercase tracking-widest text-xs">
                    Заказы не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-10 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />
          <div className="relative glass w-full max-w-2xl rounded-[40px] border border-white/10 shadow-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <header className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02] shrink-0 text-white">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                     <ShoppingBag size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Заказ {selectedOrder.displayId}</h2>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{selectedOrder.date}</p>
                  </div>
               </div>
               <button 
                onClick={() => setSelectedOrder(null)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-400 hover:text-white"
               >
                <X size={24} />
               </button>
            </header>

            <div className="p-8 overflow-y-auto space-y-8 flex-1">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Customer Info */}
                  <div className="space-y-6">
                     <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">Информация о клиенте</h3>
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <User size={18} className="text-gray-500" />
                           <span className="font-bold text-white">{selectedOrder.user}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <Phone size={18} className="text-gray-500" />
                           <span className="font-bold text-white">{selectedOrder.phone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <MapPin size={18} className="text-gray-500" />
                           <span className="text-sm font-medium text-gray-300">{selectedOrder.address}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <Tag size={18} className="text-gray-500" />
                           <span className="text-[10px] font-black uppercase bg-white/5 px-3 py-1 rounded-lg text-amber-500 border border-amber-500/20">Промокод: {selectedOrder.promoCode}</span>
                        </div>
                     </div>
                  </div>

                  {/* Status Change */}
                  <div className="space-y-6">
                     <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">Статус заказа</h3>
                     <div className="grid grid-cols-1 gap-2">
                        {(Object.entries(statusLabels) as [Order['status'], string][]).map(([key, label]) => (
                           <button
                             key={key}
                             onClick={() => handleUpdateStatus(selectedOrder.id, key)}
                             className={`w-full p-4 rounded-2xl text-left flex items-center justify-between transition-all border ${
                               selectedOrder.status === key 
                               ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-500/20 text-white' 
                               : 'bg-white/5 border-transparent hover:border-white/10 text-gray-400 hover:text-white'
                             }`}
                           >
                             <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                             {selectedOrder.status === key && <CheckCircle2 size={16} />}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Items List */}
               <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">Состав заказа</h3>
                  <div className="space-y-3">
                     {selectedOrder.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-black text-blue-500">
                                 {idx + 1}
                              </div>
                              <div>
                                 <p className="font-bold text-sm text-white">{item.name || 'Товар'}</p>
                                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">${item.price} × {item.quantity}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="font-black text-sm text-blue-400">${item.price * item.quantity}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            <footer className="p-8 border-t border-white/10 bg-white/[0.02] flex justify-between items-center shrink-0">
               <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Итоговая сумма</span>
                  <span className="text-3xl font-black text-blue-500">{selectedOrder.amount}</span>
               </div>
               <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-10 py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-gray-200 transition-all active:scale-95 shadow-2xl"
               >
                  Закрыть
               </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
