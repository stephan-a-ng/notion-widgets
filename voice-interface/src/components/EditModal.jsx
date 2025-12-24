import React, { useRef, useEffect } from 'react';
import { Trash2, CornerDownLeft } from 'lucide-react';

export function EditModal({ text, onChange, onSubmit, onCancel }) {
  const textareaRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Handle click outside to close
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative bg-zinc-900 rounded-2xl p-1 w-full max-w-2xl border border-white/10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4"
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black/50 text-white text-xl md:text-2xl font-light p-6 rounded-xl focus:outline-none resize-none"
          rows={5}
        />
        <div className="flex justify-between items-center px-4 pb-4 pt-2">
          <div className="text-xs text-zinc-500">
            <span className="font-bold text-zinc-400">Esc</span> to cancel •{' '}
            <span className="font-bold text-zinc-400">Enter</span> to send
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="p-2 hover:bg-red-500/20 rounded-full text-zinc-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onSubmit}
              className="p-2 bg-white text-black rounded-full hover:bg-zinc-200 transition-colors"
            >
              <CornerDownLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
