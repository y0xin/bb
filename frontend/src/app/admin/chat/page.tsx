"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, 
  Search, 
  User, 
  Send, 
  Check, 
  CheckCheck, 
  RefreshCw,
  MoreVertical,
  Image as ImageIcon,
  Package,
  X as CloseIcon
} from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, Product } from '@/types';

interface ChatSession {
  id: string;
  lastMessage: string;
  time: string;
  date: string;
  unread: boolean;
  rawDate: string;
}

export default function AdminChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products for picker
  const fetchProducts = useCallback(async () => {
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const res = await fetch(`${strapiUrl}/api/products?populate=*`);
      const { data } = await res.json();
      if (data) {
        setProducts(data.map((p: any) => ({
          ...p,
          id: p.id,
          image: p.image?.url ? `${strapiUrl}${p.image.url}` : '/placeholder.png'
        } as Product)));
      }
    } catch (e) {
      console.error('Product fetch error', e);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch unique chat sessions
  const fetchSessions = useCallback(async () => {
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const res = await fetch(`${strapiUrl}/api/chat-messages?sort=createdAt:desc&pagination[limit]:500`, {
        headers: { 'Authorization': `Bearer ${user?.jwt}` }
      });
      const { data } = await res.json();
      
      if (data) {
        const groups: Record<string, ChatSession> = {};
        data.forEach((msg: ChatMessage) => {
          if (!groups[msg.sessionId]) {
            groups[msg.sessionId] = {
              id: msg.sessionId,
              lastMessage: msg.text,
              time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: new Date(msg.createdAt).toLocaleDateString(),
              unread: !msg.isRead && msg.sender === 'user',
              rawDate: msg.createdAt
            };
          }
        });
        setSessions(Object.values(groups).sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()));
      }
    } catch (e) {
      console.error('Session fetch error', e);
    } finally {
      setLoading(false);
    }
  }, [user?.jwt]);

  // Initialize Socket.io
  useEffect(() => {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    const newSocket = io(strapiUrl);
    setSocket(newSocket);

    newSocket.on('receiveMessage', (data: ChatMessage) => {
      if (data.sessionId === activeSession) {
        setMessages((prev) => [...prev, { ...data, createdAt: new Date().toISOString() }]);
      }
      fetchSessions();
    });

    return () => {
      newSocket.disconnect();
    };
  }, [activeSession, fetchSessions]);

  // Fetch messages for active session
  const fetchMessages = useCallback(async (sessionId: string) => {
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const res = await fetch(`${strapiUrl}/api/chat-messages?filters[sessionId][$eq]:${sessionId}&sort=createdAt:asc&pagination[limit]:100`, {
        headers: { 'Authorization': `Bearer ${user?.jwt}` }
      });
      const { data } = await res.json();
      if (data) {
        setMessages(data);
        const unreadIds = data.filter((m: ChatMessage) => !m.isRead && m.sender === 'user').map((m: ChatMessage) => m.id);
        if (unreadIds.length > 0) {
           await Promise.all(unreadIds.map(async (id: number) => 
            await fetch(`${strapiUrl}/api/chat-messages/${id}`, {
              method: 'PUT',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.jwt}`
              },
              body: JSON.stringify({ data: { isRead: true } })
            })
           ));
        }
      }
    } catch (e) {
      console.error('Message fetch error', e);
    }
  }, [user?.jwt]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (activeSession) {
      fetchMessages(activeSession);
    }
  }, [activeSession, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !activeSession || !socket) return;
    
    setSending(true);
    try {
      const messageData = {
        text: reply,
        sender: 'admin',
        sessionId: activeSession,
        type: 'text'
      };
      socket.emit('sendMessage', messageData);
      setReply('');
    } catch (e) {
      console.error('Send error', e);
    } finally {
      setSending(false);
    }
  };

  const sendProduct = async (product: Product) => {
    if (!activeSession || !socket) return;
    try {
      const messageData = {
        text: `Посмотрите этот товар: ${product.name}`,
        sender: 'admin',
        sessionId: activeSession,
        messageType: 'product',
        product: product
      };
      socket.emit('sendMessage', messageData);
      setIsProductPickerOpen(false);
    } catch (e) {
      console.error('Send product error', e);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeSession || !socket) return;

    setUploading(true);
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const formData = new FormData();
      formData.append('files', file);

      const uploadRes = await fetch(`${strapiUrl}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user?.jwt}` },
        body: formData
      });
      
      const fileData = await uploadRes.json();
      if (fileData?.[0]?.url) {
        const imageUrl = `${strapiUrl}${fileData[0].url}`;
        const messageData = {
          text: 'Sent an image',
          sender: 'admin',
          sessionId: activeSession,
          messageType: 'image',
          image: imageUrl
        };
        socket.emit('sendMessage', messageData);
      }
    } catch (e) {
      console.error('Image upload error', e);
    } finally {
      setUploading(false);
    }
  };

  if (loading && sessions.length === 0) return (
    <div className="h-[600px] flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-in fade-in duration-700">
      <div className="w-96 flex flex-col glass rounded-[40px] border border-white/10 overflow-hidden shadow-2xl">
         <header className="p-8 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight text-white">Сообщения</h2>
            <button onClick={fetchSessions} className="p-2 hover:bg-white/5 rounded-xl transition-all">
               <RefreshCw size={18} className="text-gray-400" />
            </button>
         </header>
         
         <div className="p-4 border-b border-white/10">
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
               <input 
                type="text" 
                placeholder="Поиск чатов..." 
                className="w-full bg-white/5 border border-transparent focus:border-blue-500/50 p-3 pl-12 rounded-2xl outline-none text-sm transition-all text-white"
               />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto divide-y divide-white/5 text-white">
            {sessions.map((session) => (
               <button 
                key={session.id}
                onClick={() => setActiveSession(session.id)}
                className={`w-full p-6 text-left flex items-center gap-4 transition-all hover:bg-white/[0.03] ${activeSession === session.id ? 'bg-blue-600/20 border-r-2 border-r-blue-500' : ''}`}
               >
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                       <User size={20} className="text-gray-400" />
                    </div>
                    {session.unread && <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-black animate-pulse" />}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-black truncate">Session {session.id.slice(0, 8)}</span>
                        <span className="text-[10px] text-gray-500 font-bold">{session.time}</span>
                     </div>
                     <p className={`text-xs truncate ${session.unread ? 'text-white font-bold' : 'text-gray-400 font-medium'}`}>
                        {session.lastMessage}
                     </p>
                  </div>
               </button>
            ))}
            {sessions.length === 0 && (
               <div className="p-10 text-center space-y-4">
                  <MessageSquare size={48} className="mx-auto text-white/5" />
                  <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Нет активных чатов</p>
               </div>
            )}
         </div>
      </div>

      <div className="flex-1 flex flex-col glass rounded-[40px] border border-white/10 overflow-hidden shadow-2xl text-white">
         {activeSession ? (
           <>
             <header className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <User size={24} className="text-white" />
                   </div>
                   <div>
                      <h2 className="text-xl font-black tracking-tight">Active Session</h2>
                      <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">@{activeSession}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all"><MoreVertical size={20} /></button>
                </div>
             </header>

             <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth">
                {messages.map((msg, i) => (
                   <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-5 rounded-[28px] shadow-lg ${
                         msg.sender === 'admin' 
                         ? 'bg-blue-600 text-white rounded-tr-none' 
                         : 'glass border border-white/5 text-gray-200 rounded-tl-none'
                      }`}>
                         <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                         <div className={`mt-2 flex items-center gap-2 text-[10px] font-bold ${msg.sender === 'admin' ? 'text-blue-100/60' : 'text-gray-500'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {msg.sender === 'admin' && (
                               msg.isRead ? <CheckCheck size={12} /> : <Check size={12} />
                            )}
                         </div>
                         
                         {msg.messageType === 'product' && msg.product && (
                            <div className="mt-4 bg-black/20 rounded-2xl overflow-hidden border border-white/10">
                               <img src={msg.product.image} alt={msg.product.name} className="w-full h-32 object-cover" />
                               <div className="p-3">
                                  <p className="text-xs font-black truncate">{msg.product.name}</p>
                                  <p className="text-blue-400 font-bold">${msg.product.price}</p>
                               </div>
                            </div>
                         )}

                         {msg.messageType === 'image' && msg.image && (
                            <div className="mt-2 rounded-2xl overflow-hidden border border-white/10 max-w-sm">
                               <img src={msg.image} alt="Sent image" className="w-full h-auto object-contain max-h-96" />
                            </div>
                         )}
                      </div>
                   </div>
                ))}
             </div>

             <form onSubmit={handleSend} className="p-8 border-t border-white/10 bg-white/[0.01]">
                 <div className="relative flex items-center gap-4">
                    <button 
                      type="button" 
                      onClick={() => setIsProductPickerOpen(!isProductPickerOpen)}
                      className={`p-4 rounded-2xl transition-all ${isProductPickerOpen ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                      title="Прикрепить товар"
                    >
                       <Package size={20} />
                    </button>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden" 
                      accept="image/*"
                    />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 transition-all disabled:opacity-50"
                      title="Прикрепить изображение"
                    >
                       {uploading ? <RefreshCw className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                    </button>
                    <input 
                     type="text" 
                     value={reply}
                     onChange={(e) => setReply(e.target.value)}
                     placeholder="Напишите сообщение..." 
                     className="flex-1 bg-white/5 border border-white/10 focus:border-blue-500/50 p-5 rounded-2xl outline-none text-sm transition-all font-medium text-white shadow-inner"
                    />
                    <button 
                     type="submit"
                     disabled={sending || !reply.trim()}
                     className="p-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-2xl shadow-xl shadow-blue-500/30 text-white transition-all active:scale-95"
                    >
                       {sending ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>

                    {/* Product Picker Popover */}
                    {isProductPickerOpen && (
                      <div className="absolute bottom-full left-0 mb-4 w-80 glass rounded-[32px] border border-white/10 shadow-3xl overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
                         <header className="p-4 border-b border-white/10 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Выберите товар</span>
                            <button onClick={() => setIsProductPickerOpen(false)}><CloseIcon size={14} /></button>
                         </header>
                         <div className="p-4">
                            <input 
                              type="text" 
                              placeholder="Поиск..." 
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 p-2 px-4 rounded-xl outline-none text-xs mb-4"
                            />
                            <div className="max-h-60 overflow-y-auto space-y-2">
                               {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                                 <button 
                                  key={p.id}
                                  onClick={() => sendProduct(p)}
                                  className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-all"
                                 >
                                    <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />
                                    <div className="text-left overflow-hidden">
                                       <p className="text-[10px] font-black truncate">{p.name}</p>
                                       <p className="text-[9px] text-blue-400 font-bold">${p.price}</p>
                                    </div>
                                 </button>
                               ))}
                            </div>
                         </div>
                      </div>
                    )}
                 </div>
             </form>
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-gray-600">
              <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center animate-pulse">
                 <MessageSquare size={48} className="text-white" />
              </div>
              <p className="font-black uppercase tracking-widest text-xs text-white">Выберите чат для начала общения</p>
           </div>
         )}
      </div>
    </div>
  );
}
