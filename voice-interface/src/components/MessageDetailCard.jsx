import React, { useRef, useEffect } from 'react';
import { X, Calendar, Mail } from 'lucide-react';

export function MessageDetailCard({ message, onClose }) {
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

  const hasCalendar = message.calendarIds?.length > 0;
  const hasEmail = message.emailIds?.length > 0;

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-6 overflow-y-auto animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div
        ref={contentRef}
        className="w-full max-w-2xl bg-zinc-900 rounded-2xl border border-white/10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-white/10">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm text-zinc-400 line-clamp-2">{message.text}</p>
            <p className="text-[10px] text-zinc-600 mt-1 font-mono">
              {message.timestamp?.toLocaleString?.() || 'Unknown time'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar Section */}
        {hasCalendar && (
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-blue-400 mb-3">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Calendar Events</span>
              <span className="text-xs text-zinc-500">({message.calendarIds.length})</span>
            </div>

            {/* Placeholder for future calendar data */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
              <p className="text-sm text-zinc-400">
                Calendar event details will appear here once connected.
              </p>
              <div className="mt-3 space-y-1">
                {message.calendarIds.map((id, i) => (
                  <p key={i} className="text-xs text-zinc-600 font-mono truncate">
                    ID: {id}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Email Section */}
        {hasEmail && (
          <div className="p-4">
            <div className="flex items-center gap-2 text-green-400 mb-3">
              <Mail className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Email Thread</span>
              <span className="text-xs text-zinc-500">({message.emailIds.length})</span>
            </div>

            {/* Placeholder for future email data */}
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
              <p className="text-sm text-zinc-400">
                Email thread will appear here once connected.
              </p>
              <div className="mt-3 space-y-1">
                {message.emailIds.map((id, i) => (
                  <p key={i} className="text-xs text-zinc-600 font-mono truncate">
                    ID: {id}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No links message */}
        {!hasCalendar && !hasEmail && (
          <div className="p-8 text-center text-zinc-600">
            <p className="text-sm">No calendar events or emails linked to this message</p>
          </div>
        )}
      </div>
    </div>
  );
}
