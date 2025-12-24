import React from 'react';
import { Check } from 'lucide-react';

export function ThemePreview({ theme, isActive, onClick, index }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-6 focus:outline-none"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative w-24 h-24 md:w-32 md:h-32 transition-transform duration-300 group-hover:scale-110">
        <div
          className={`absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 ${theme.glow}`}
        />
        <div
          className={`
            w-full h-full rounded-full
            bg-[length:200%_200%] bg-gradient-to-r ${theme.idle}
            animate-blob-idle shadow-2xl
            border-2 ${isActive ? 'border-white' : 'border-transparent group-hover:border-white/20'}
          `}
        />
        {isActive && (
          <div className="absolute -bottom-2 -right-2 bg-white text-black p-1.5 rounded-full shadow-lg">
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>
      <span
        className={`text-sm font-medium tracking-widest uppercase transition-colors ${
          isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'
        }`}
      >
        {theme.name}
      </span>
    </button>
  );
}
