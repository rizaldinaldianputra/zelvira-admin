'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api.client';

export interface ChatRoom {
  id: number;
  roomId: string;
  customerName?: string;
  customerEmail?: string;
  customerAvatar?: string;
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export function useSupportRooms() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fetchRooms = async () => {
    try {
      console.log('[useSupportRooms] Fetching /v1/chat/rooms...');
      const response = await apiClient.get<any>('/v1/chat/rooms');
      console.log('[useSupportRooms] Raw response:', response);

      const list = Array.isArray(response)
        ? response
        : (response?.data && Array.isArray(response.data) ? response.data : []);

      console.log('[useSupportRooms] Parsed list count:', list.length);
      setRooms(list);

      // Auto-select first room if none is currently selected
      setSelectedRoomId((current) => {
        if (!current && list.length > 0) {
          return list[0].roomId;
        }
        return current;
      });
    } catch (error) {
      console.error('[useSupportRooms] Failed to fetch chat rooms', error);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 6000);
    return () => clearInterval(interval);
  }, []);

  const filteredRooms = rooms.filter((room) => {
    const q = searchTerm.toLowerCase();
    return (
      room.roomId.toLowerCase().includes(q) ||
      (room.customerName && room.customerName.toLowerCase().includes(q)) ||
      (room.customerEmail && room.customerEmail.toLowerCase().includes(q))
    );
  });

  return {
    rooms,
    selectedRoomId,
    setSelectedRoomId,
    searchTerm,
    setSearchTerm,
    filteredRooms,
    fetchRooms,
  };
}
