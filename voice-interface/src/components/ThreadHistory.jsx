import React from 'react';
import { MessageSquare, X } from 'lucide-react';

export function ThreadHistory({ messages, onClear }) {
  if (messages.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2 px-2">
        <MessageSquare className="w-3 h-3" />
        Thread History
      </div>

      {messages.map((msg, index) => (
        <div
          key={msg.id}
          className="bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-2xl border border-white/5 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards group"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex justify-between items-start gap-4">
            <p className="text-white/80 text-lg font-light leading-relaxed">{msg.text}</p>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-xs text-zinc-500 font-mono">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[10px] text-green-400/80 bg-green-900/20 px-2 py-1 rounded-full border border-green-900/30">
              Sent
            </span>
          </div>
        </div>
      ))}

      <div className="flex justify-center mt-4">
        <button
          onClick={onClear}
          className="text-xs text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-2 px-4 py-2"
        >
          <X className="w-3 h-3" />
          Clear Thread
        </button>
      </div>
    </div>
  );
}
