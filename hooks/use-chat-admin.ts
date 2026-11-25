'use client';

import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { apiClient } from '@/services/api.client';

export interface ChatMessage {
  id?: number;
  roomId: string;
  senderId: string;
  senderRole: string;
  content: string;
  attachmentUrl?: string;
  type?: 'CHAT' | 'JOIN' | 'LEAVE' | 'ERROR_COOLDOWN';
  createdAt?: string;
}

export function useChatAdmin(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const stompClient = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const isProd = process.env.NODE_ENV === 'production';

    // Reset messages for the new room
    setMessages([]);

    // 1. Fetch Chat History first
    console.log(`[useChatAdmin] Fetching history for room: ${roomId}`);
    apiClient.get<any>(`/v1/chat/${roomId}/history`)
      .then(response => {
        console.log(`[useChatAdmin] History response for ${roomId}:`, response);
        const rawList = Array.isArray(response)
          ? response
          : (response?.data && Array.isArray(response.data) ? response.data : []);

        const mapped: ChatMessage[] = rawList.map((item: any) => ({
          id: item.id,
          roomId: roomId,
          senderId: item.senderId || '',
          senderRole: item.senderRole || '',
          content: item.content || '',
          attachmentUrl: item.attachmentUrl || undefined,
          type: item.type || 'CHAT',
          createdAt: item.createdAt
        }));
        setMessages(mapped);
      })
      .catch(err => console.error(`[useChatAdmin] Failed to load history for ${roomId}:`, err));

    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const wsUrl = isLocalhost
      ? 'http://localhost:8081/ws-chat'
      : (isProd ? 'https://api.zelvira.my.id/ws-chat' : 'http://localhost:8081/ws-chat');

    // 2. Connect WebSocket
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      onConnect: () => {
        setIsConnected(true);
        // Subscribe to the room
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const receivedMessage: ChatMessage = JSON.parse(message.body);
          if (!receivedMessage.type) {
            receivedMessage.type = 'CHAT';
          }
          setMessages((prev) => [...prev, receivedMessage]);
        });

        // Announce join
        client.publish({
          destination: `/app/chat/${roomId}/addUser`,
          body: JSON.stringify({
            roomId,
            senderId: 'ADMIN',
            senderRole: 'ADMIN',
            type: 'JOIN'
          }),
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    client.activate();
    stompClient.current = client;

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [roomId]);

  const handleFileUpload = async (): Promise<string | null> => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await apiClient.post<any>('/v1/upload', formData);
      return data.url;
    } catch (e) {
      console.error("Upload failed", e);
      return null;
    }
  };

  const sendMessage = async () => {
    if ((!inputMessage.trim() && !file) || !stompClient.current || !isConnected) return;

    let attachmentUrl = undefined;
    if (file) {
      attachmentUrl = await handleFileUpload();
      setFile(null);
    }

    const chatMessage: ChatMessage = {
      roomId,
      senderId: 'ADMIN',
      senderRole: 'ADMIN',
      content: inputMessage,
      attachmentUrl: attachmentUrl || undefined,
      type: 'CHAT'
    };

    stompClient.current.publish({
      destination: `/app/chat/${roomId}/sendMessage`,
      body: JSON.stringify(chatMessage),
    });

    setInputMessage('');
  };

  return {
    messages,
    inputMessage,
    setInputMessage,
    file,
    setFile,
    isConnected,
    sendMessage
  };
}
