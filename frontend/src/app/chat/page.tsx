"use client";
import Navbar from '@/components/Navbar';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, ImageIcon, Bot } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import Image from 'next/image';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  type: 'text' | 'image' | 'product';
  timestamp: Date;
  image?: string;
  sessionId?: string;
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const loadHistory = useCallback(async (sId: string) => {
    try {
      const res = await fetch(`${STRAPI_URL}/api/chat-messages?filters[sessionId][$eq]=${sId}&sort=createdAt:asc&pagination[limit]=50`);
      const data = await res.json();
      if (data.data) {
        setMessages(data.data.map((m: any) => ({
          id: m.id,
          text: m.text,
          sender: m.sender,
          type: m.messageType || 'text',
          timestamp: new Date(m.createdAt),
          image: m.image
        })));
      }
    } catch (e) {
      console.error('Failed to load chat history', e);
    }
  }, []);

  useEffect(() => {
    // Generate and save sessionId if not exists
    if (typeof window !== 'undefined' && !sessionId) {
      let sId = localStorage.getItem('chat_session_id');
      if (!sId) {
        sId = 'sess_' + Math.random().toString(36).slice(2, 11);
        localStorage.setItem('chat_session_id', sId);
      }
      setSessionId(sId);
      return;
    }

    if (!sessionId) return;
    
    // Initial load
    loadHistory(sessionId);

    // Socket connection
    const socket = io(STRAPI_URL);
    socketRef.current = socket;

    socket.on('receiveMessage', (data: any) => {
      // Re-read sessionId from state
      if (data.sessionId === sessionId || data.sender === 'admin') {
         setMessages(prev => [...prev, {
           ...data,
           timestamp: new Date(data.timestamp),
           id: Date.now().toString() + Math.random().toString(36)
         }]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [loadHistory, sessionId]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || !socketRef.current) return;
    
    const newMsg = {
      text: input,
      sender: 'user',
      sessionId: sessionId,
      type: 'text',
      timestamp: new Date(),
    };

    socketRef.current.emit('sendMessage', newMsg);
    setInput('');
  }, [input, sessionId]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !socketRef.current) return;
    const reader = new FileReader();
    reader.onload = () => {
      const newMsg = {
        text: file.name,
        sender: 'user',
        sessionId: sessionId,
        type: 'image',
        timestamp: new Date(),
        image: reader.result as string,
      };
      socketRef.current?.emit('sendMessage', newMsg);
    };
    reader.readAsDataURL(file);
  }, [sessionId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  }, [sendMessage]);

  return (
    <main className="min-h-screen hero-gradient flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 pt-8 pb-4 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Поддержка Antigravity</h1>
            <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               Онлайн
            </p>
          </div>
        </div>

        <div className="flex-1 glass rounded-3xl border border-white/10 p-6 overflow-y-auto mb-4 space-y-6 max-h-[60vh] shadow-2xl relative scrollbar-thin scrollbar-thumb-white/10">
          {messages.length === 0 && (
            <div className="text-center py-20 flex flex-col items-center justify-center space-y-4 opacity-30">
              <Bot size={48} className="text-white" />
              <p className="text-white font-black uppercase tracking-widest text-[10px]">Ваша история сообщений пуста</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={msg.id || i} className={`flex w-full animate-in slide-in-from-bottom-2 duration-300 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[70%] rounded-[24px] p-6 shadow-xl ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md shadow-blue-500/20'
                  : 'glass border border-white/10 rounded-bl-md text-white'
              }`}>
                {msg.type === 'image' && msg.image && (
                  <div className="relative w-full h-48 mb-4 overflow-hidden rounded-2xl group">
                    <Image 
                      src={msg.image} 
                      alt={msg.text} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                )}
                <p className="text-sm font-medium leading-relaxed leading-relaxed">{msg.text}</p>
                <div className={`flex items-center gap-2 mt-3 ${msg.sender === 'user' ? 'text-white/60' : 'text-gray-500'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {msg.timestamp.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start animate-in fade-in duration-300">
               <div className="glass border border-white/10 rounded-[20px] rounded-bl-md px-6 py-4 flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-500 delay-300">
          <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="glass p-4 rounded-2xl hover:bg-white/20 transition-all border border-white/10 text-white group"
            title="Прикрепить изображение"
          >
            <ImageIcon size={22} className="group-active:scale-90 transition-transform" />
          </button>
          <div className="flex-1 relative group">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напишите сообщение..."
              className="w-full glass p-5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-white/10 text-white font-medium bg-transparent"
            />
          </div>
          <button 
            onClick={sendMessage} 
            disabled={!input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-5 rounded-2xl transition-all shadow-xl shadow-blue-500/30 active:scale-95"
          >
            <Send size={22} />
          </button>
        </div>
      </div>
    </main>
  );
}
