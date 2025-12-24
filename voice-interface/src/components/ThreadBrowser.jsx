import React from 'react';
import { Clock, MessageSquare, Trash2, Plus, X, ChevronRight } from 'lucide-react';

export function ThreadBrowser({ threads, currentThreadId, onSelect, onDelete, onNewThread, onClose }) {
  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300"
      data-no-touch-talk
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-zinc-400" />
          Thread History
        </h2>
        <button
          onClick={onClose}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* New Thread Button */}
      <div className="p-4 border-b border-white/10">
        <button
          onClick={() => {
            onNewThread();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Start New Thread
        </button>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {threads.length === 0 ? (
          <div className="text-center text-zinc-500 py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No saved threads yet</p>
            <p className="text-sm mt-1">Your conversations will appear here</p>
          </div>
        ) : (
          threads.map((thread, index) => (
            <div
              key={thread.id}
              className={`
                group relative rounded-xl border transition-all cursor-pointer
                animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards
                ${thread.id === currentThreadId
                  ? 'bg-white/10 border-white/20'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/15'
                }
              `}
              style={{ animationDelay: `${index * 30}ms` }}
              onClick={() => {
                onSelect(thread.id);
                onClose();
              }}
            >
              <div className="p-4 pr-12">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">
                      {thread.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {thread.messages.length} messages
                      </span>
                      <span>{formatDate(thread.updatedAt)}</span>
                    </div>
                    {thread.messages.length > 0 && (
                      <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
                        {thread.messages[0]?.text}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Chevron indicator */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 group-hover:text-zinc-400 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>

              {/* Delete button (shown on hover) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(thread.id);
                }}
                className="absolute right-12 top-4 p-1.5 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                title="Delete thread"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
