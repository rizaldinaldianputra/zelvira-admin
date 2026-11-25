'use client';

import React from 'react';
import { useChatAdmin } from '@/hooks/use-chat-admin';

export default function ChatAdmin({ roomId = 'general' }: { roomId?: string }) {
  const {
    messages,
    inputMessage,
    setInputMessage,
    file,
    setFile,
    isConnected,
    sendMessage
  } = useChatAdmin(roomId);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full bg-white shadow-lg overflow-hidden">
      <div className="p-4 border-b bg-blue-600 text-white">
        <h3 className="font-bold">CS Support Chat {isConnected ? '(Online)' : '(Connecting...)'}</h3>
        <p className="text-sm opacity-80">Room: {roomId}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
            Belum ada pesan dalam room ini.
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.senderRole === 'ADMIN' ? 'items-end' : 'items-start'}`}>
              {msg.type === 'JOIN' ? (
                <div className="text-xs text-gray-400 my-2 self-center">{msg.senderId} joined</div>
              ) : msg.type === 'ERROR_COOLDOWN' ? (
                <div className="self-center bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-1.5 rounded-full my-2 flex items-center gap-1 font-medium shadow-xs">
                  ⚠️ {msg.content}
                </div>
              ) : (
                <div className={`max-w-[80%] rounded-2xl p-3 ${msg.senderRole === 'ADMIN' ? 'bg-blue-600 text-white rounded-tr-none' : msg.senderRole === 'AI' ? 'bg-purple-50 border border-purple-200 text-purple-950 rounded-tl-none' : 'bg-gray-100 text-gray-900 rounded-tl-none'}`}>
                  <div className={`text-[10px] font-bold mb-1 ${msg.senderRole === 'ADMIN' ? 'text-blue-100' : msg.senderRole === 'AI' ? 'text-purple-600' : 'text-gray-500'}`}>
                    {msg.senderRole === 'AI' ? '🤖 Zelvira AI Assistant' : msg.senderId}
                  </div>
                  {msg.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                  {msg.attachmentUrl && (
                    <div className="mt-2">
                      {msg.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null ? (
                        <img src={msg.attachmentUrl} alt="attachment" className="max-w-xs rounded-xl shadow-xs" />
                      ) : (
                        <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className="text-xs underline flex items-center gap-1">
                          📎 View Attachment
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-gray-50">
        {file && <div className="text-sm text-green-600 mb-2">Attachment: {file.name}</div>}
        <div className="flex space-x-2">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <label htmlFor="file-upload" className="cursor-pointer p-2 bg-gray-200 rounded hover:bg-gray-300">
            📎
          </label>
          <input
            type="text"
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={!isConnected}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}


