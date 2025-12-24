import React from 'react';
import { MessageSquare, X, User, Bot, Clock, Plus, ArrowLeft } from 'lucide-react';

export function ThreadHistory({ messages, onClear, onShowHistory, onNewThread, hasHistory, isViewingHistory }) {
  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Thread Controls - Always show */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
          <MessageSquare className="w-3 h-3" />
          {isViewingHistory ? 'Past Conversation' : messages.length > 0 ? 'Current Thread' : 'Thread'}
        </div>
        <div className="flex items-center gap-1">
          {isViewingHistory && (
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <ArrowLeft className="w-3 h-3" />
              Back
            </button>
          )}
          <button
            onClick={onNewThread}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-green-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <Plus className="w-3 h-3" />
            New
          </button>
          <button
            onClick={onShowHistory}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-blue-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <Clock className="w-3 h-3" />
            History
          </button>
        </div>
      </div>

      {messages.length === 0 && !isViewingHistory && (
        <div className="text-center py-8 text-zinc-600">
          <p className="text-sm">No messages in this thread yet</p>
          <p className="text-xs mt-2 text-zinc-700">Hold anywhere or press space to talk</p>
        </div>
      )}

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

      {messages.length > 0 && !isViewingHistory && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onClear}
            className="text-xs text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-2 px-4 py-2"
          >
            <X className="w-3 h-3" />
            Clear Thread
          </button>
        </div>
      )}
    </div>
  );
}
