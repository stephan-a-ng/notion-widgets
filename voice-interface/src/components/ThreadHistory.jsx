import React from 'react';
import { MessageSquare, X, User, Bot, Clock, Plus, ArrowLeft, Keyboard } from 'lucide-react';

export function ThreadHistory({ messages, onClear, onShowHistory, onNewThread, onTextInput, hasHistory, isViewingHistory }) {
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
          {onTextInput && (
            <button
              onClick={onTextInput}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-purple-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <Keyboard className="w-3 h-3" />
              Type
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
            className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={`
                max-w-[85%] p-3 rounded-2xl backdrop-blur-sm
                animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards
                transition-colors
                ${isAssistant
                  ? 'bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 rounded-bl-md'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10 rounded-br-md'
                }
              `}
            >
              <p className={`text-sm leading-relaxed ${isAssistant ? 'text-blue-100/90' : 'text-white/80'}`}>
                {msg.text}
              </p>
              <div className={`mt-1.5 flex items-center gap-2 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {/* Status indicator for user messages */}
                {!isAssistant && msg.status && (
                  <div
                    className={`w-1.5 h-1.5 rounded-sm transition-colors ${
                      msg.status === 'pending' ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                    }`}
                    title={msg.status === 'pending' ? 'Sending...' : 'Confirmed'}
                  />
                )}
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
