"use client";
import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage } from '@/types';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chat_session_id') || '';
    }
    return '';
  });

  useEffect(() => {
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

    const socket = io(STRAPI_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to chat system');
    });

    socket.on('receiveMessage', (message: ChatMessage) => {
      const currentSId = localStorage.getItem('chat_session_id');
      if (message.sessionId === currentSId || message.sender === 'admin') {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId]);

  const sendMessage = useCallback((text: string, type: ChatMessage['messageType'] = 'text', additionalData: Partial<ChatMessage> = {}) => {
    if (socketRef.current && sessionId) {
      const messageData = {
        text,
        sender: 'user',
        messageType: type,
        sessionId,
        timestamp: new Date(),
        ...additionalData
      };
      socketRef.current.emit('sendMessage', messageData);
    }
  }, [sessionId]);

  return { messages, sendMessage, sessionId };
};
