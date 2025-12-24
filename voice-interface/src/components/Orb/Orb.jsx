import React from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import './Orb.css';

export function Orb({
  mode,
  theme,
  unlockStatus,
  apiError,
  isCompact,
  isLocked,
  onClick
}) {
  const getOrbGradient = () => {
    if (unlockStatus === 'level1') return 'from-red-950 via-red-900 to-black';
    if (unlockStatus === 'level2' || unlockStatus === 'lockout') return 'from-red-600 via-red-500 to-orange-600';
    if (apiError) return 'from-red-950 via-red-600 to-red-950';
    if (mode === 'thinking') return theme.active;
    return mode === 'listening' ? theme.active : theme.idle;
  };

  const getGlowStyles = () => {
    if (unlockStatus === 'level1') return 'bg-red-900 opacity-20 scale-100';
    if (unlockStatus === 'level2' || unlockStatus === 'lockout') return 'bg-red-600 opacity-60 scale-110';
    if (apiError) return 'bg-red-600 opacity-50 scale-110';
    if (mode === 'thinking' && !isCompact) return `${theme.glow} opacity-30 scale-115`;
    if (mode === 'listening' && !isCompact) return `${theme.glow} opacity-40 scale-125`;
    return 'opacity-0 scale-90';
  };

  const getOrbAnimation = () => {
    if (unlockStatus === 'level1' || unlockStatus === 'level2' || unlockStatus === 'lockout') {
      return 'animate-blob-idle';
    }
    if (mode === 'thinking') return 'animate-blob-thinking';
    return mode === 'listening' ? 'animate-blob-active' : 'animate-blob-idle';
  };

  return (
    <div
      className={`
        absolute top-1/2 -translate-y-1/2 group cursor-pointer
        transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        ${isCompact ? 'left-4 w-14 h-14' : 'left-1/2 -translate-x-1/2 w-48 h-48 md:w-64 md:h-64'}
        opacity-100
      `}
      onClick={onClick}
    >
      {/* Dynamic Glow */}
      <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-500 ${getGlowStyles()}`} />

      {/* Orbiting Electrons (thinking state) */}
      {mode === 'thinking' && !isCompact && (
        <div className="electron-orbit-container">
          <div className="electron electron-1" />
          <div className="electron electron-2" />
          <div className="electron electron-3" />
        </div>
      )}

      {/* Dynamic Orb */}
      <div
        className={`
          w-full h-full bg-[length:400%_400%]
          bg-gradient-to-r
          ${getOrbGradient()}
          transition-all duration-700 ease-in-out
          shadow-[inset_-2px_-2px_10px_rgba(0,0,0,0.2),0_0_15px_rgba(255,255,255,0.3)]
          ${getOrbAnimation()}
          hover:scale-105
        `}
        style={{
          borderRadius: mode === 'listening' || mode === 'thinking' || apiError
            ? '45% 55% 40% 60% / 55% 45% 60% 40%'
            : '50% 50% 50% 50% / 50% 50% 50% 50%'
        }}
      >
        {!isCompact && (
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${mode === 'listening' || mode === 'pending' || (isLocked && !unlockStatus.startsWith('level')) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            {unlockStatus === 'idle' && !isLocked && (
              <>
                {mode === 'listening' && <MicOff className="text-white/80 w-12 h-12" />}
                {mode === 'pending' && <Send className="text-white/80 w-12 h-12 animate-pulse" />}
                {mode === 'idle' && <Mic className="text-white/80 w-12 h-12" />}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
