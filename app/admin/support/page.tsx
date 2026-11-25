'use client';

import ChatAdmin from '@/components/admin/ChatAdmin';
import { Card } from '@/components/ui/card';
import { MessagesSquare, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSupportRooms } from '@/hooks/use-support-rooms';

export default function SupportChatPage() {
  const {
    selectedRoomId,
    setSelectedRoomId,
    searchTerm,
    setSearchTerm,
    filteredRooms,
  } = useSupportRooms();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <MessagesSquare className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Customer Support & Live Chat</h1>
            <p className="text-slate-500 text-sm mt-0.5">Layanan bantuan pelanggan interaktif dan respon pesan langsung real-time.</p>
          </div>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden bg-white/60 shadow-xl border-none rounded-3xl flex">
        <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Search room ID..." 
                className="pl-10 rounded-full border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredRooms.length === 0 ? (
              <div className="text-center p-8 text-slate-400 text-sm font-medium">
                No active chat rooms found.
              </div>
            ) : (
              filteredRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.roomId)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all ${
                    selectedRoomId === room.roomId 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'hover:bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {room.customerAvatar ? (
                      <img 
                        src={room.customerAvatar} 
                        alt={room.customerName || 'Avatar'} 
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        selectedRoomId === room.roomId ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {(room.customerName || room.roomId).substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold truncate text-sm">
                          {room.customerName || room.roomId}
                        </span>
                        <span className={`text-[10px] font-medium shrink-0 ml-1 ${selectedRoomId === room.roomId ? 'text-blue-200' : 'text-slate-400'}`}>
                          {room.updatedAt ? new Date(room.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <div className={`text-xs truncate ${selectedRoomId === room.roomId ? 'text-blue-100' : 'text-slate-500'}`}>
                        {room.lastMessage || 'Belum ada pesan'}
                      </div>
                      {room.customerEmail && (
                        <div className={`text-[11px] truncate mt-0.5 ${selectedRoomId === room.roomId ? 'text-blue-200' : 'text-slate-400'}`}>
                          {room.customerEmail}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 bg-white/50 flex flex-col">
          {selectedRoomId ? (
            <ChatAdmin roomId={selectedRoomId} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <MessagesSquare size={48} className="opacity-20" />
              <p className="font-medium text-sm">Select a room from the left to start chatting</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
