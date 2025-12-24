import React from 'react';
import { MessageSquare, X, User, Bot } from 'lucide-react';

export function ThreadHistory({ messages, onClear }) {
  if (messages.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2 px-2">
        <MessageSquare className="w-3 h-3" />
        Thread History
      </div>

      {messages.map((msg, index) => {
        const isAssistant = msg.role === 'assistant';

        return (
          <div
            key={msg.id}
            className={`
              p-4 rounded-2xl border backdrop-blur-sm
              animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards group
              transition-colors
              ${isAssistant
                ? 'bg-blue-500/10 hover:bg-blue-500/15 border-blue-500/20 ml-4'
                : 'bg-white/5 hover:bg-white/10 border-white/5 mr-4'
              }
            `}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className={`shrink-0 p-1.5 rounded-full ${isAssistant ? 'bg-blue-500/20' : 'bg-white/10'}`}>
                {isAssistant
                  ? <Bot className="w-3 h-3 text-blue-400" />
                  : <User className="w-3 h-3 text-zinc-400" />
                }
              </div>
              <div className="flex-1">
                <p className={`text-lg font-light leading-relaxed ${isAssistant ? 'text-blue-100/90' : 'text-white/80'}`}>
                  {msg.text}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-zinc-500 font-mono">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`text-[10px] px-2 py-1 rounded-full border ${
                    isAssistant
                      ? 'text-blue-400/80 bg-blue-900/20 border-blue-900/30'
                      : 'text-green-400/80 bg-green-900/20 border-green-900/30'
                  }`}>
                    {isAssistant ? 'Assistant' : 'You'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

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
