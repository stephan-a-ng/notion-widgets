import React, { useRef, useEffect } from 'react';
import { Clock, MessageSquare, Plus, X, ChevronRight, Loader2, RefreshCw, ArrowLeft } from 'lucide-react';

export function ThreadBrowser({ threads, currentThreadId, onSelect, onNewThread, onClose, isLoading, onRefresh }) {
  const contentRef = useRef(null);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle click outside to close
  const handleBackdropClick = (e) => {
    if (contentRef.current && !contentRef.current.contains(e.target)) {
      onClose();
    }
  };
  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-start p-6 overflow-y-auto animate-in fade-in duration-300"
      data-no-touch-talk
      onClick={handleBackdropClick}
    >
      {/* Content container - matches ThreadHistory width */}
      <div ref={contentRef} className="w-full max-w-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
            <Clock className="w-3 h-3" />
            Conversation History
          </div>
          <div className="flex items-center gap-1">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className={`flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 ${isLoading ? 'animate-spin' : ''}`}
                disabled={isLoading}
              >
                <RefreshCw className="w-3 h-3" />
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
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <ArrowLeft className="w-3 h-3" />
              Back
            </button>
          </div>
        </div>

        {/* Thread List */}
        {isLoading && threads.length === 0 ? (
          <div className="text-center text-zinc-500 py-12">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
            <p className="text-sm">Loading conversations...</p>
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center text-zinc-600 py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1 text-zinc-700">Your conversations will appear here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {threads.map((thread, index) => (
              <div
                key={thread.id}
                className={`
                  group p-4 rounded-2xl border backdrop-blur-sm cursor-pointer
                  animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards
                  transition-colors
                  ${thread.id === currentThreadId
                    ? 'bg-blue-500/10 border-blue-500/20'
                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                  }
                `}
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => {
                  onSelect(thread.id);
                  onClose();
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Thread name or first message */}
                    <p className="text-base font-medium text-white line-clamp-1">
                      {thread.title}
                    </p>
                    {/* Show first message as subtitle if thread has custom name */}
                    {thread.hasCustomName && thread.requestText && (
                      <p className="mt-1 text-sm text-zinc-500 line-clamp-1">
                        {thread.requestText}
                      </p>
                    )}
                    {/* AI response preview */}
                    {thread.responseText && (
                      <p className="mt-1.5 text-sm text-zinc-400 line-clamp-2">
                        {thread.responseText}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
                      <span>{formatDate(thread.lastMessageAt || thread.createdAt)}</span>
                      {thread.messageCount > 1 && (
                        <span className="px-2 py-0.5 bg-white/10 rounded text-zinc-400">
                          {thread.messageCount} msgs
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
