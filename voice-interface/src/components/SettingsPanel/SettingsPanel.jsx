import React, { useRef, useEffect } from 'react';
import { Settings, Palette } from 'lucide-react';
import { DeviceSelector } from './DeviceSelector';

export function SettingsPanel({
  isOpen,
  onToggle,
  onClose,
  currentTheme,
  onThemeClick,
  audioDevices,
  selectedDeviceId,
  onDeviceChange
}) {
  const settingsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="relative" ref={settingsRef}>
      <button
        onClick={onToggle}
        className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors backdrop-blur-sm"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-14 w-72 bg-zinc-900 border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 border-b border-white/10">
            <button
              onClick={onThemeClick}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                <div className="text-left">
                  <div className="text-sm font-medium text-zinc-200">Appearance</div>
                  <div className="text-xs text-zinc-500">Current: {currentTheme.name}</div>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${currentTheme.idle}`} />
            </button>
          </div>

          <DeviceSelector
            devices={audioDevices}
            selectedDeviceId={selectedDeviceId}
            onDeviceChange={onDeviceChange}
          />
        </div>
      )}
    </div>
  );
}
