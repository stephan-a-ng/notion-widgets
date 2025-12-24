import React from 'react';
import { X } from 'lucide-react';
import { ThemePreview } from './ThemePreview';

export function ThemeSelector({ themes, currentTheme, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="text-center mb-12 animate-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-3xl font-light text-white mb-2">Choose your vibe</h2>
        <p className="text-zinc-500">Select a color theme for your assistant</p>
      </div>

      <div className="flex flex-wrap justify-center gap-8 md:gap-12 px-6 max-w-5xl">
        {themes.map((theme, index) => (
          <ThemePreview
            key={theme.id}
            theme={theme}
            isActive={currentTheme.id === theme.id}
            onClick={() => onSelect(theme)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
